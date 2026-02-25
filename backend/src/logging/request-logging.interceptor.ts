import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { getCorrelationId } from './correlation-id.middleware';

/**
 * Intercepteur de Logging des Requêtes HTTP
 *
 * Cet intercepteur:
 * - Log automatiquement toutes les requêtes HTTP entrantes
 * - Mesure la durée de traitement
 * - Capture les erreurs et les log avec le stack trace
 * - Enrichit les logs avec le contexte de la requête
 *
 * Les logs générés sont au format JSON pour Loki:
 * - Requête entrante: niveau INFO
 * - Requête réussie (2xx/3xx): niveau INFO
 * - Erreur client (4xx): niveau WARN
 * - Erreur serveur (5xx): niveau ERROR
 */
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, originalUrl, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const correlationId = getCorrelationId(request);

    // Crée un logger avec le correlation ID
    const requestLogger = this.logger.child('HTTP', correlationId);

    const startTime = Date.now();

    // Log la requête entrante
    requestLogger.debug(`Incoming ${method} ${originalUrl}`, {
      method,
      path: originalUrl,
      ip: this.anonymizeIp(ip),
      userAgent,
      correlationId,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        requestLogger.logRequest(method, originalUrl, statusCode, duration, {
          correlationId,
          ip: this.anonymizeIp(ip),
          userAgent,
          userId: this.extractUserId(request),
        });
      }),
      catchError((error: Error) => {
        const duration = Date.now() - startTime;
        const statusCode = this.getErrorStatusCode(error);

        requestLogger.error(error, error.stack, {
          method,
          path: originalUrl,
          statusCode,
          duration,
          correlationId,
          ip: this.anonymizeIp(ip),
          userAgent,
          userId: this.extractUserId(request),
        });

        throw error;
      }),
    );
  }

  /**
   * Anonymise l'IP pour conformité RGPD
   */
  private anonymizeIp(ip: string | undefined): string {
    if (!ip) return 'unknown';

    // Pour IPv4, masque le dernier octet
    if (ip.includes('.')) {
      const parts = ip.split('.');
      parts[3] = 'xxx';
      return parts.join('.');
    }

    // Pour IPv6, masque les derniers segments
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx:xxxx';
    }

    return 'unknown';
  }

  /**
   * Extrait l'ID utilisateur de la requête si disponible
   */
  private extractUserId(request: Request): string | undefined {
    const user = (request as Request & { user?: { id?: string; sub?: string } })
      .user;
    return user?.id || user?.sub;
  }

  /**
   * Récupère le code de statut HTTP depuis une erreur
   */
  private getErrorStatusCode(error: unknown): number {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      return error.status;
    }
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
    ) {
      return error.statusCode;
    }
    return 500;
  }
}
