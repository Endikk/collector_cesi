import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-31');
      const result = service.getDashboardMetrics(start, end);

      expect(result).toHaveProperty('gmv');
      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('newUsers');
      expect(result).toHaveProperty('activeListings');
      expect(result).toHaveProperty('conversionRate');
      expect(result).toHaveProperty('avgOrderValue');
      expect(result).toHaveProperty('revenue');
    });
  });

  describe('getSalesTrends', () => {
    it('should return sales trends for day period', () => {
      const result = service.getSalesTrends('day', 7);
      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
      expect(result.datasets[0]).toHaveProperty('name');
      expect(result.datasets[0]).toHaveProperty('data');
    });

    it('should return sales trends for month period', () => {
      const result = service.getSalesTrends('month');
      expect(result.datasets).toHaveLength(1);
    });
  });

  describe('getCategoryPerformance', () => {
    it('should return category performance data', () => {
      const result = service.getCategoryPerformance(5);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('category');
      expect(result[0]).toHaveProperty('revenue');
      expect(result[0]).toHaveProperty('itemsSold');
    });
  });

  describe('getTopSellers', () => {
    it('should return top sellers', () => {
      const result = service.getTopSellers(5);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('sellerId');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('sales');
    });
  });

  describe('getConversionFunnel', () => {
    it('should return conversion funnel data', () => {
      const result = service.getConversionFunnel();
      expect(result).toHaveProperty('visitors');
      expect(result).toHaveProperty('completed');
      expect(result).toHaveProperty('conversionRate');
      expect(result.conversionRate).toBeCloseTo((847 / 15420) * 100, 2);
    });
  });

  describe('getCohortAnalysis', () => {
    it('should return cohort analysis by month', () => {
      const result = service.getCohortAnalysis('month');
      expect(result).toHaveProperty('cohorts');
      expect(result.cohorts[0]).toHaveProperty('period');
      expect(result.cohorts[0]).toHaveProperty('users');
      expect(result.cohorts[0]).toHaveProperty('retention');
    });
  });

  describe('predictSales', () => {
    it('should return sales predictions', () => {
      const result = service.predictSales(3);
      expect(result).toHaveProperty('predictions');
      expect(result.predictions).toHaveLength(3);
      expect(result.predictions[0]).toHaveProperty('month');
      expect(result.predictions[0]).toHaveProperty('predicted');
      expect(result.predictions[0]).toHaveProperty('confidence');
    });
  });
});
