import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

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
    ],
    exports: [
        'PROM_METRIC_HTTP_REQUESTS_TOTAL',
        'PROM_METRIC_HTTP_REQUEST_DURATION_SECONDS',
    ],
})
export class PrometheusConfigModule { }
