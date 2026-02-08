import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SalesReportService } from './sales-report.service';
import { DashboardService } from './dashboard.service';

/**
 * ADVANCED ANALYTICS MODULE (Future Feature)
 *
 * Business intelligence and reporting for management
 *
 * Features:
 * - Sales analytics (trends, forecasts, cohorts)
 * - Inventory analytics (turnover, dead stock)
 * - User behavior analytics (funnel, conversion)
 * - Revenue tracking (GMV, commission)
 * - Category performance
 * - Seller performance metrics
 * - Export to Excel/PDF
 * - Scheduled reports (email)
 * - Real-time dashboards
 * - Custom date ranges
 * - Comparative analysis (YoY, MoM)
 *
 * Tech Stack suggestions:
 * - Time-series DB: TimescaleDB or InfluxDB
 * - Visualization: Chart.js, Recharts
 * - Export: ExcelJS, PDFKit
 * - Caching: Redis for computed metrics
 */
@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, SalesReportService, DashboardService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

/**
 * USAGE:
 *
 * 1. Add to app.module.ts (Admin only)
 *
 * 2. API endpoints:
 *    GET /analytics/dashboard         - Overview metrics
 *    GET /analytics/sales             - Sales trends
 *    GET /analytics/revenue           - Revenue breakdown
 *    GET /analytics/categories        - Category performance
 *    GET /analytics/sellers           - Top sellers
 *    GET /analytics/users             - User growth
 *    GET /analytics/funnel            - Conversion funnel
 *    POST /analytics/export           - Export report
 *    POST /analytics/schedule         - Schedule recurring report
 *
 * 3. Metrics tracked:
 *    - GMV (Gross Merchandise Value)
 *    - Net revenue (after commission)
 *    - Transaction count
 *    - Average order value
 *    - Conversion rate
 *    - User acquisition cost
 *    - Lifetime value
 *    - Churn rate
 *    - Inventory turnover
 *    - Category trends
 *
 * 4. Integration with Event Bus:
 *    - Listen to all business events
 *    - Aggregate metrics in real-time
 *    - Store in time-series format
 */
