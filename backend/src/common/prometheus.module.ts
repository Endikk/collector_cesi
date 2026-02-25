import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
    }),
    // Fraud Detection metrics
    makeCounterProvider({
      name: 'fraud_analyses_total',
      help: 'Total number of fraud analyses performed',
    }),
    makeCounterProvider({
      name: 'fraud_alerts_total',
      help: 'Total number of fraud alerts triggered',
      labelNames: ['severity', 'type'],
    }),
    makeCounterProvider({
      name: 'fraud_manual_reviews_total',
      help: 'Total number of items flagged for manual review',
    }),
  ],
  exports: [
    'PROM_METRIC_HTTP_REQUESTS_TOTAL',
    'PROM_METRIC_HTTP_REQUEST_DURATION_SECONDS',
    'PROM_METRIC_FRAUD_ANALYSES_TOTAL',
    'PROM_METRIC_FRAUD_ALERTS_TOTAL',
    'PROM_METRIC_FRAUD_MANUAL_REVIEWS_TOTAL',
  ],
})
export class PrometheusConfigModule {}
