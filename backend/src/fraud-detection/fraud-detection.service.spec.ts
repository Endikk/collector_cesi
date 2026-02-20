import { Test, TestingModule } from '@nestjs/testing';
import {
  FraudDetectionService,
  PriceChangeEvent,
  FraudAlert,
} from './fraud-detection.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FraudDetectionService', () => {
  let service: FraudDetectionService;

  const mockPrisma = {
    priceHistory: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    item: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    fraudAlert: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  // Mock Prometheus counters
  const mockFraudAnalysesTotal = { inc: jest.fn() };
  const mockFraudAlertsTotal = { inc: jest.fn() };
  const mockFraudManualReviewsTotal = { inc: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudDetectionService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: 'PROM_METRIC_FRAUD_ANALYSES_TOTAL',
          useValue: mockFraudAnalysesTotal,
        },
        {
          provide: 'PROM_METRIC_FRAUD_ALERTS_TOTAL',
          useValue: mockFraudAlertsTotal,
        },
        {
          provide: 'PROM_METRIC_FRAUD_MANUAL_REVIEWS_TOTAL',
          useValue: mockFraudManualReviewsTotal,
        },
      ],
    }).compile();

    service = module.get<FraudDetectionService>(FraudDetectionService);
    jest.clearAllMocks();
  });

  // Helper pour créer un événement de base
  const createEvent = (
    overrides: Partial<PriceChangeEvent> = {},
  ): PriceChangeEvent => ({
    itemId: 'item-1',
    itemTitle: 'Figurine Star Wars',
    oldPrice: 100,
    newPrice: 120,
    priceChange: 20,
    priceChangePercent: 20,
    sellerId: 'seller-1',
    sellerEmail: 'seller@test.com',
    sellerType: 'INDIVIDUAL',
    timestamp: new Date(),
    ...overrides,
  });

  // ============================================================
  // analyzePriceChange()
  // ============================================================
  describe('analyzePriceChange()', () => {
    it('should return no alerts for normal price change (<50%)', async () => {
      const event = createEvent({ priceChangePercent: 20 });
      const alerts = await service.analyzePriceChange(event);

      expect(alerts).toHaveLength(0);
      expect(mockFraudAnalysesTotal.inc).toHaveBeenCalledTimes(1);
    });

    it('should trigger MEDIUM alert for +50-200% price increase', async () => {
      const event = createEvent({
        oldPrice: 100,
        newPrice: 180,
        priceChangePercent: 80,
      });
      const alerts = await service.analyzePriceChange(event);

      expect(alerts.some((a) => a.severity === 'MEDIUM')).toBe(true);
      expect(alerts.some((a) => a.type === 'HIGH_PRICE_INCREASE')).toBe(true);
      expect(mockFraudAlertsTotal.inc).toHaveBeenCalled();
    });

    it('should trigger CRITICAL alert for +200% price increase', async () => {
      const event = createEvent({
        oldPrice: 50,
        newPrice: 200,
        priceChangePercent: 300,
      });
      const alerts = await service.analyzePriceChange(event);

      expect(alerts.some((a) => a.severity === 'CRITICAL')).toBe(true);
      expect(alerts.some((a) => a.type === 'EXTREME_PRICE_INCREASE')).toBe(
        true,
      );
    });

    it('should trigger alert for price > 10000€', async () => {
      const event = createEvent({
        newPrice: 15000,
        priceChangePercent: 10,
      });
      const alerts = await service.analyzePriceChange(event);

      expect(alerts.some((a) => a.type === 'UNUSUAL_HIGH_PRICE')).toBe(true);
    });

    it('should trigger alert for suspicious price decrease (-30%)', async () => {
      const event = createEvent({
        oldPrice: 200,
        newPrice: 100,
        priceChange: -100,
        priceChangePercent: -50,
      });
      const alerts = await service.analyzePriceChange(event);

      expect(alerts.some((a) => a.type === 'SIGNIFICANT_PRICE_DECREASE')).toBe(
        true,
      );
    });

    it('should increment Prometheus fraud_manual_reviews_total on CRITICAL alert', async () => {
      const event = createEvent({
        priceChangePercent: 500,
      });
      await service.analyzePriceChange(event);

      expect(mockFraudManualReviewsTotal.inc).toHaveBeenCalled();
    });
  });

  // ============================================================
  // requiresManualReview()
  // ============================================================
  describe('requiresManualReview()', () => {
    it('should require review when CRITICAL alert exists', () => {
      const alerts: FraudAlert[] = [
        {
          severity: 'CRITICAL',
          type: 'EXTREME_PRICE_INCREASE',
          message: 'Test',
          itemId: 'item-1',
          sellerId: 'seller-1',
          timestamp: new Date(),
          details: {},
        },
      ];
      expect(service.requiresManualReview(alerts)).toBe(true);
    });

    it('should require review when 2+ HIGH alerts exist', () => {
      const alerts: FraudAlert[] = [
        {
          severity: 'HIGH',
          type: 'TYPE_1',
          message: 'Test 1',
          itemId: 'item-1',
          sellerId: 'seller-1',
          timestamp: new Date(),
          details: {},
        },
        {
          severity: 'HIGH',
          type: 'TYPE_2',
          message: 'Test 2',
          itemId: 'item-1',
          sellerId: 'seller-1',
          timestamp: new Date(),
          details: {},
        },
      ];
      expect(service.requiresManualReview(alerts)).toBe(true);
    });

    it('should not require review for LOW alerts only', () => {
      const alerts: FraudAlert[] = [
        {
          severity: 'LOW',
          type: 'TYPE_1',
          message: 'Low alert',
          itemId: 'item-1',
          sellerId: 'seller-1',
          timestamp: new Date(),
          details: {},
        },
      ];
      expect(service.requiresManualReview(alerts)).toBe(false);
    });

    it('should not require review for empty alerts', () => {
      expect(service.requiresManualReview([])).toBe(false);
    });
  });
});
