import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesService } from './notification-preferences.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache';

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;
  let prisma: Record<string, any>;
  let cache: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      notificationPreferences: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    };

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferencesService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: cache },
      ],
    }).compile();

    service = module.get<NotificationPreferencesService>(
      NotificationPreferencesService,
    );
  });

  describe('getPreferences', () => {
    it('should return cached preferences on cache hit', async () => {
      const prefs = { userId: 'u1', emailMessages: true };
      cache.get.mockResolvedValue(prefs);

      const result = await service.getPreferences('u1');
      expect(result).toEqual(prefs);
      expect(prisma.notificationPreferences.findUnique).not.toHaveBeenCalled();
    });

    it('should query DB on cache miss', async () => {
      const prefs = { userId: 'u1', emailMessages: true };
      cache.get.mockResolvedValue(null);
      prisma.notificationPreferences.findUnique.mockResolvedValue(prefs);

      const result = await service.getPreferences('u1');
      expect(result).toEqual(prefs);
      expect(cache.set).toHaveBeenCalledWith(
        'notification-prefs:u1',
        prefs,
        3600, // TTL in seconds (not milliseconds)
      );
    });

    it('should create default preferences if none exist', async () => {
      const defaultPrefs = { userId: 'u1' };
      cache.get.mockResolvedValue(null);
      prisma.notificationPreferences.findUnique.mockResolvedValue(null);
      prisma.notificationPreferences.create.mockResolvedValue(defaultPrefs);

      const result = await service.getPreferences('u1');
      expect(result).toEqual(defaultPrefs);
      expect(prisma.notificationPreferences.create).toHaveBeenCalledWith({
        data: { userId: 'u1' },
      });
    });
  });

  describe('updatePreferences', () => {
    it('should upsert preferences and update cache', async () => {
      const data = { emailMessages: false, inAppMessages: true };
      const updated = { userId: 'u1', ...data };
      prisma.notificationPreferences.upsert.mockResolvedValue(updated);

      const result = await service.updatePreferences('u1', data);
      expect(result).toEqual(updated);
      expect(cache.set).toHaveBeenCalledWith(
        'notification-prefs:u1',
        updated,
        3600, // TTL in seconds (not milliseconds)
      );
    });
  });

  describe('invalidateCache', () => {
    it('should delete cache for user', async () => {
      await service.invalidateCache('u1');
      expect(cache.del).toHaveBeenCalledWith('notification-prefs:u1');
    });
  });
});
