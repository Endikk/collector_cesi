import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdatePreferencesDto {
  emailNewItem?: boolean;
  emailMatchingInterest?: boolean;
  emailMessages?: boolean;
  emailTransactions?: boolean;
  inAppNewItem?: boolean;
  inAppMatchingInterest?: boolean;
  inAppMessages?: boolean;
  inAppTransactions?: boolean;
}

@Injectable()
export class NotificationPreferencesService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  private getCacheKey(userId: string): string {
    return `notification-prefs:${userId}`;
  }

  async getPreferences(userId: string) {
    // Try to get from cache first
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      console.log(`Cache HIT for user ${userId} preferences`);
      return cached;
    }

    console.log(`Cache MISS for user ${userId} preferences`);

    let prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!prefs) {
      prefs = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, prefs, this.CACHE_TTL);

    return prefs;
  }

  async updatePreferences(userId: string, data: UpdatePreferencesDto) {
    // Upsert: create if doesn't exist, update if exists
    const prefs = await this.prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    // Update cache
    const cacheKey = this.getCacheKey(userId);
    await this.cacheService.set(cacheKey, prefs, this.CACHE_TTL);
    console.log(`Cache UPDATED for user ${userId} preferences`);

    return prefs;
  }

  async invalidateCache(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    await this.cacheService.del(cacheKey);
    console.log(`Cache INVALIDATED for user ${userId} preferences`);
  }
}
