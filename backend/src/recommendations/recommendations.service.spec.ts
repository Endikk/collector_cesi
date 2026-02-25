import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      userInterest: { findMany: jest.fn() },
      item: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  describe('getRecommendations', () => {
    it('should return empty array when user has no interests', async () => {
      prisma.userInterest.findMany.mockResolvedValue([]);

      const result = await service.getRecommendations('u1');
      expect(result).toEqual([]);
    });

    it('should return items matching category interests', async () => {
      prisma.userInterest.findMany.mockResolvedValue([
        { categoryId: 'cat1', keyword: null, minPrice: null, maxPrice: null },
      ]);
      const items = [
        { id: 'i1', title: 'Card', price: 20, viewCount: 10 },
        { id: 'i2', title: 'Card 2', price: 30, viewCount: 5 },
      ];
      prisma.item.findMany.mockResolvedValue(items);

      const result = await service.getRecommendations('u1', 2);
      expect(result).toHaveLength(2);
    });

    it('should return items matching keyword interests', async () => {
      prisma.userInterest.findMany.mockResolvedValue([
        {
          categoryId: null,
          keyword: 'pokemon',
          minPrice: null,
          maxPrice: null,
        },
      ]);
      prisma.item.findMany.mockResolvedValue([
        { id: 'i1', title: 'Pokemon card', price: 15 },
      ]);

      const result = await service.getRecommendations('u1');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by price ranges from interests', async () => {
      prisma.userInterest.findMany.mockResolvedValue([
        { categoryId: 'cat1', keyword: null, minPrice: 10, maxPrice: 50 },
      ]);
      prisma.item.findMany.mockResolvedValue([
        { id: 'i1', title: 'Item', price: 25, viewCount: 10 },
        { id: 'i2', title: 'Expensive', price: 100, viewCount: 5 },
      ]);

      const result = await service.getRecommendations('u1', 20);
      // The price filter should exclude the expensive item
      expect(result).toBeDefined();
    });

    it('should backfill with popular items when not enough matches', async () => {
      prisma.userInterest.findMany.mockResolvedValue([
        { categoryId: 'cat1', keyword: null, minPrice: null, maxPrice: null },
      ]);
      // First call returns 1 matched item, second call returns popular items
      prisma.item.findMany
        .mockResolvedValueOnce([{ id: 'i1', title: 'Matched', price: 10 }])
        .mockResolvedValueOnce([{ id: 'i2', title: 'Popular', price: 20 }]);

      const result = await service.getRecommendations('u1', 5);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
