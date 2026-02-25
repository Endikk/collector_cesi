/**
 * Logging Module - Point d'entrée
 *
 * Ce module fournit une infrastructure de logging centralisé
 * compatible avec la stack Loki/Grafana pour l'observabilité.
 *
 * Usage:
 * ```typescript
 * import { LoggingModule, LoggerService } from './logging';
 *
 * // Dans un module
 * @Module({ imports: [LoggingModule] })
 * export class MyModule {}
 *
 * // Dans un service
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly logger: LoggerService) {
 *     this.logger.setContext('MyService');
 *   }
 *
 *   doSomething() {
 *     this.logger.log('Action effectuée');
 *     this.logger.logBusinessEvent('ORDER_CREATED', { orderId: '123' });
 *   }
 * }
 * ```
 */

export { LoggingModule } from './logging.module';
export { LoggerService } from './logger.service';
export type { LogLevel, LogContext } from './logger.service';
export {
  CorrelationIdMiddleware,
  CORRELATION_ID_HEADER,
  CORRELATION_ID_KEY,
  getCorrelationId,
} from './correlation-id.middleware';
export type { RequestWithCorrelationId } from './correlation-id.middleware';
export { RequestLoggingInterceptor } from './request-logging.interceptor';
