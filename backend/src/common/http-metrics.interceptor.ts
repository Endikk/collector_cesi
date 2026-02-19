import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
    constructor(
        @InjectMetric('http_requests_total') public requestsTotal: Counter<string>,
        @InjectMetric('http_request_duration_seconds') public requestDuration: Histogram<string>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const duration = (Date.now() - start) / 1000;
                const method = req.method;
                const route = req.route ? req.route.path : req.url;
                const status = res.statusCode.toString();

                this.requestsTotal.inc({ method, route, status_code: status });
                this.requestDuration.observe({ method, route, status_code: status }, duration);
            }),
        );
    }
}
