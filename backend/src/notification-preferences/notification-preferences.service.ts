import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(userId: string): string {
    return `notification-prefs:${userId}`;
  }

  async getPreferences(userId: string) {
    // Try to get from cache first
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get(cacheKey);

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
    await this.cacheManager.set(cacheKey, prefs, 3600000);

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
    await this.cacheManager.set(cacheKey, prefs, 3600000);
    console.log(`Cache UPDATED for user ${userId} preferences`);

    return prefs;
  }

  async invalidateCache(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    await this.cacheManager.del(cacheKey);
    console.log(`Cache INVALIDATED for user ${userId} preferences`);
  }
}
