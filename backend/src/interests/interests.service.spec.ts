import { Test, TestingModule } from '@nestjs/testing';
import { InterestsService } from './interests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InterestsService', () => {
  let service: InterestsService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      userInterest: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InterestsService>(InterestsService);
  });

  describe('getUserInterests', () => {
    it('should return interests for a user', async () => {
      const interests = [
        {
          id: 'int1',
          userId: 'u1',
          keyword: 'pokemon',
          category: { id: 'c1', name: 'Cartes' },
        },
      ];
      prisma.userInterest.findMany.mockResolvedValue(interests);

      const result = await service.getUserInterests('u1');
      expect(result).toEqual(interests);
      expect(prisma.userInterest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
    });
  });

  describe('createInterest', () => {
    it('should create a new interest', async () => {
      const data = { keyword: 'naruto', categoryId: 'c1' };
      prisma.userInterest.create.mockResolvedValue({
        id: 'int1',
        userId: 'u1',
        ...data,
      });

      const result = await service.createInterest('u1', data);
      expect(result.keyword).toBe('naruto');
      expect(result.userId).toBe('u1');
    });

    it('should create interest with price range', async () => {
      const data = { minPrice: 10, maxPrice: 100 };
      prisma.userInterest.create.mockResolvedValue({
        id: 'int2',
        userId: 'u1',
        ...data,
      });

      const result = await service.createInterest('u1', data);
      expect(result.minPrice).toBe(10);
      expect(result.maxPrice).toBe(100);
    });
  });

  describe('updateInterest', () => {
    it('should update an existing interest', async () => {
      prisma.userInterest.findUnique.mockResolvedValue({
        id: 'int1',
        userId: 'u1',
      });
      prisma.userInterest.update.mockResolvedValue({
        id: 'int1',
        keyword: 'updated',
      });

      const result = await service.updateInterest('int1', 'u1', {
        keyword: 'updated',
      });
      expect(result.keyword).toBe('updated');
    });

    it('should throw if interest not found', async () => {
      prisma.userInterest.findUnique.mockResolvedValue(null);

      await expect(
        service.updateInterest('bad', 'u1', { keyword: 'x' }),
      ).rejects.toThrow('Interest not found or access denied');
    });

    it('should throw if user does not own the interest', async () => {
      prisma.userInterest.findUnique.mockResolvedValue({
        id: 'int1',
        userId: 'other',
      });

      await expect(
        service.updateInterest('int1', 'u1', { keyword: 'x' }),
      ).rejects.toThrow('Interest not found or access denied');
    });
  });

  describe('deleteInterest', () => {
    it('should delete an interest', async () => {
      prisma.userInterest.findUnique.mockResolvedValue({
        id: 'int1',
        userId: 'u1',
      });
      prisma.userInterest.delete.mockResolvedValue({ id: 'int1' });

      const result = await service.deleteInterest('int1', 'u1');
      expect(result).toEqual({ id: 'int1' });
    });

    it('should throw if interest not found', async () => {
      prisma.userInterest.findUnique.mockResolvedValue(null);

      await expect(service.deleteInterest('bad', 'u1')).rejects.toThrow(
        'Interest not found or access denied',
      );
    });

    it('should throw if user does not own the interest', async () => {
      prisma.userInterest.findUnique.mockResolvedValue({
        id: 'int1',
        userId: 'other',
      });

      await expect(service.deleteInterest('int1', 'u1')).rejects.toThrow(
        'Interest not found or access denied',
      );
    });
  });
});
