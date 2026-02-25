import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        status: 'requires_payment_method',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPrisma = {
    item: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_placeholder';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    jest.clearAllMocks();
  });

  // ============================================================
  // createPaymentIntent()
  // ============================================================
  describe('createPaymentIntent()', () => {
    const validItem = {
      id: 'item-1',
      title: 'Figurine Star Wars',
      price: 150,
      published: true,
      status: 'AVAILABLE',
      ownerId: 'seller-1',
      owner: { id: 'seller-1', name: 'Seller' },
      transaction: null,
    };

    it('should create a payment intent for a valid item', async () => {
      mockPrisma.item.findUnique.mockResolvedValue(validItem);
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'tx-1',
        amount: 150,
        commission: 7.5,
        status: 'PENDING',
      });

      const result = await service.createPaymentIntent('item-1', 'buyer-1');

      expect(result.clientSecret).toBe('pi_test_123_secret');
      expect(result.amount).toBe(150);
      expect(result.commission).toBe(7.5); // 5% de 150
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockPrisma.item.findUnique.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent('nonexistent', 'buyer-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when item is not published', async () => {
      mockPrisma.item.findUnique.mockResolvedValue({
        ...validItem,
        published: false,
      });

      await expect(
        service.createPaymentIntent('item-1', 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when item is not AVAILABLE', async () => {
      mockPrisma.item.findUnique.mockResolvedValue({
        ...validItem,
        status: 'SOLD',
      });

      await expect(
        service.createPaymentIntent('item-1', 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when item already sold', async () => {
      mockPrisma.item.findUnique.mockResolvedValue({
        ...validItem,
        transaction: { id: 'tx-existing' },
      });

      await expect(
        service.createPaymentIntent('item-1', 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when buyer is the owner', async () => {
      mockPrisma.item.findUnique.mockResolvedValue(validItem);

      await expect(
        service.createPaymentIntent('item-1', 'seller-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate 5% commission correctly', async () => {
      const expensiveItem = { ...validItem, price: 1000 };
      mockPrisma.item.findUnique.mockResolvedValue(expensiveItem);
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'tx-2',
        amount: 1000,
        commission: 50,
        status: 'PENDING',
      });

      const result = await service.createPaymentIntent('item-1', 'buyer-1');
      expect(result.commission).toBe(50);
    });
  });

  // ============================================================
  // getPaymentStatus()
  // ============================================================
  describe('getPaymentStatus()', () => {
    it('should return payment status for existing transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: 'COMPLETED',
        stripePaymentIntentId: 'pi_test_123',
        amount: 150,
      });

      const result = await service.getPaymentStatus('tx-1');
      expect(result.status).toBe('COMPLETED');
      expect(result.stripeStatus).toBe('succeeded');
    });

    it('should throw NotFoundException for nonexistent transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.getPaymentStatus('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
