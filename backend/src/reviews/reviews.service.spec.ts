import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  transaction: {
    findUnique: jest.fn(),
  },
  review: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    it('should create a review if valid', async () => {
      const mockTransaction = {
        id: 't1',
        buyerId: 'b1',
        sellerId: 's1',
        review: null,
      };
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      const mockReview = { id: 'r1', rating: 5 };
      mockPrismaService.review.create.mockResolvedValue(mockReview);

      const result = await service.createReview({
        rating: 5,
        authorId: 'b1',
        transactionId: 't1',
      });

      expect(result).toEqual(mockReview);
    });

    it('should throw BadRequest if transaction already reviewed', async () => {
      const mockTransaction = {
        id: 't1',
        buyerId: 'b1',
        sellerId: 's1',
        review: { id: 'r1' },
      };
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      await expect(
        service.createReview({
          rating: 5,
          authorId: 'b1',
          transactionId: 't1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFound if transaction not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);
      await expect(
        service.createReview({
          rating: 5,
          authorId: 'b1',
          transactionId: 't1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
