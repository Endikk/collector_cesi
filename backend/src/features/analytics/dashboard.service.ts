import { Injectable } from '@nestjs/common';

/**
 * DASHBOARD SERVICE
 * Real-time metrics for executive dashboard
 */
@Injectable()
export class DashboardService {
  getRealTimeMetrics() {
    return {
      currentOnlineUsers: 245,
      todaySales: 15420,
      activeTransactions: 12,
      pendingValidations: 8,
      fraudAlerts: 2,
    };
  }

  getKeyMetrics(period: '24h' | '7d' | '30d' | '90d') {
    console.log('Fetching key metrics for period:', period);
    return {
      gmv: 125000,
      revenue: 6250,
      orders: 847,
      newUsers: 152,
      activeListings: 3421,
      changes: {
        gmv: '+15.2%',
        revenue: '+16.8%',
        orders: '+12.3%',
        newUsers: '+8.7%',
      },
    };
  }
}
