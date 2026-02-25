import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/**
 * ANALYTICS CONTROLLER
 * Requires admin authentication
 */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Query('start') start: string, @Query('end') end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.analyticsService.getDashboardMetrics(startDate, endDate);
  }

  @Get('sales/trends')
  getSalesTrends(
    @Query('period') period: 'day' | 'week' | 'month',
    @Query('count') count?: number,
  ) {
    return this.analyticsService.getSalesTrends(period, Number(count) || 30);
  }

  @Get('categories')
  getCategoryPerformance(@Query('limit') limit?: number) {
    return this.analyticsService.getCategoryPerformance(Number(limit) || 10);
  }

  @Get('sellers')
  getTopSellers(@Query('limit') limit?: number) {
    return this.analyticsService.getTopSellers(Number(limit) || 10);
  }

  @Get('funnel')
  getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }

  @Get('cohorts')
  getCohorts(@Query('by') cohortBy: 'month' | 'week' = 'month') {
    return this.analyticsService.getCohortAnalysis(cohortBy);
  }

  @Get('predictions')
  getPredictions(@Query('months') months?: number) {
    return this.analyticsService.predictSales(Number(months) || 3);
  }
}
