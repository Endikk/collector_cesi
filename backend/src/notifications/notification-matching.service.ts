import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { NotificationPreferences } from '@prisma/client';
import { CacheService } from '../cache';
import { PrismaService } from '../prisma/prisma.service';

export interface MatchResult {
  userId: string;
  userEmail: string;
  userName: string;
  matchReason: string;
}

@Injectable()
export class NotificationMatchingService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
    private cacheService: CacheService,
  ) {}

  /**
   * Find all users who should be notified about a new item
   * based on their interests and notification preferences
   */
  async findMatchingUsers(item: {
    id: string;
    title: string;
    description: string;
    price: number;
    categoryId: string | null;
    ownerId: string;
  }): Promise<MatchResult[]> {
    // Get all users with interests (excluding the item owner)
    const usersWithInterests = await this.prisma.user.findMany({
      where: {
        id: {
          not: item.ownerId,
        },
        interests: {
          some: {},
        },
      },
      include: {
        interests: {
          include: {
            category: true,
          },
        },
      },
    });

    const matches: MatchResult[] = [];

    for (const user of usersWithInterests) {
      const matchReasons: string[] = [];

      for (const interest of user.interests) {
        // Check category match
        if (interest.categoryId && interest.categoryId === item.categoryId) {
          matchReasons.push(
            `Catégorie: ${interest.category?.name || 'Inconnue'}`,
          );
        }

        // Check keyword match in title or description
        if (interest.keyword) {
          const keyword = interest.keyword.toLowerCase();
          const titleMatch = item.title.toLowerCase().includes(keyword);
          const descMatch = item.description.toLowerCase().includes(keyword);

          if (titleMatch || descMatch) {
            matchReasons.push(`Mot-clé: "${interest.keyword}"`);
          }
        }

        // Check price range
        if (interest.minPrice !== null || interest.maxPrice !== null) {
          const minValid =
            interest.minPrice === null || item.price >= interest.minPrice;
          const maxValid =
            interest.maxPrice === null || item.price <= interest.maxPrice;

          if (minValid && maxValid) {
            const priceRange =
              interest.minPrice && interest.maxPrice
                ? `${interest.minPrice}€ - ${interest.maxPrice}€`
                : interest.minPrice
                  ? `${interest.minPrice}€+`
                  : `jusqu'à ${interest.maxPrice}€`;
            matchReasons.push(`Prix: ${priceRange}`);
          }
        }
      }

      // If at least one interest matches, add to results
      if (matchReasons.length > 0) {
        matches.push({
          userId: user.id,
          userEmail: user.email,
          userName: user.name || 'Utilisateur',
          matchReason: matchReasons.join(', '),
        });
      }
    }

    return matches;
  }

  /**
   * Notify users about a new item based on their preferences
   */
  async notifyNewItem(item: {
    id: string;
    title: string;
    description: string;
    price: number;
    categoryId: string | null;
    ownerId: string;
  }): Promise<void> {
    const itemUrl = `${process.env.FRONTEND_URL || 'https://localhost:3000'}/items/${item.id}`;

    // 1. Find users with matching interests
    const matchingUsers = await this.findMatchingUsers(item);

    // 2. Notify matching users (with interest-based notifications)
    for (const match of matchingUsers) {
      await this.sendNotificationToUser(
        match.userId,
        match.userEmail,
        match.userName,
        item,
        itemUrl,
        match.matchReason,
        true, // isInterestMatch
      );
    }

    // 3. Notify all other users who want general new item notifications
    // (excluding item owner and users already notified)
    const matchingUserIds = matchingUsers.map((m) => m.userId);
    const otherUsers = await this.prisma.user.findMany({
      where: {
        id: {
          not: item.ownerId,
          notIn: matchingUserIds,
        },
        notificationPreferences: {
          OR: [{ inAppNewItem: true }, { emailNewItem: true }],
        },
      },
      include: {
        notificationPreferences: true,
      },
    });

    for (const user of otherUsers) {
      await this.sendNotificationToUser(
        user.id,
        user.email,
        user.name || 'Utilisateur',
        item,
        itemUrl,
        null,
        false, // isInterestMatch
      );
    }
  }

  private async sendNotificationToUser(
    userId: string,
    userEmail: string,
    userName: string,
    item: { id: string; title: string },
    itemUrl: string,
    matchReason: string | null,
    isInterestMatch: boolean,
  ): Promise<void> {
    // Try to get user preferences from cache first
    const cacheKey = `notification-prefs:${userId}`;
    let prefs = await this.cacheService.get<NotificationPreferences>(cacheKey);

    if (!prefs) {
      // Get or create user preferences from database
      const dbPrefs = await this.prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!dbPrefs) {
        // Create default preferences if they don't exist
        prefs = await this.prisma.notificationPreferences.create({
          data: { userId },
        });
      } else {
        prefs = dbPrefs;
      }

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, prefs, this.CACHE_TTL);
    }

    const notificationType = isInterestMatch ? 'MATCHING_INTEREST' : 'NEW_ITEM';
    const shouldSendInApp = isInterestMatch
      ? prefs.inAppMatchingInterest
      : prefs.inAppNewItem;
    const shouldSendEmail = isInterestMatch
      ? prefs.emailMatchingInterest
      : prefs.emailNewItem;

    // Send in-app notification (synchronous - fast)
    if (shouldSendInApp) {
      await this.prisma.notification.create({
        data: {
          userId,
          type: notificationType,
          data: JSON.stringify({
            itemId: item.id,
            itemTitle: item.title,
            itemUrl,
            matchReason,
          }),
        },
      });
    }

    // Queue email notification (asynchronous - with retry)
    if (shouldSendEmail) {
      if (isInterestMatch && matchReason) {
        await this.emailQueue.add(
          'send-matching-interest',
          {
            userEmail,
            userName,
            itemTitle: item.title,
            itemUrl,
            matchReason,
          },
          {
            attempts: 3, // Retry 3 times on failure
            backoff: {
              type: 'exponential',
              delay: 2000, // Start with 2s, then 4s, then 8s
            },
            removeOnComplete: true,
          },
        );
        console.log(`Queued matching interest email for ${userEmail}`);
      } else {
        await this.emailQueue.add(
          'send-new-item',
          {
            userEmail,
            userName,
            itemTitle: item.title,
            itemUrl,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: true,
          },
        );
        console.log(`Queued new item email for ${userEmail}`);
      }
    }
  }
}
