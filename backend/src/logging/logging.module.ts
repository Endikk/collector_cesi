import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerService } from './logger.service';
import { RequestLoggingInterceptor } from './request-logging.interceptor';
import { CorrelationIdMiddleware } from './correlation-id.middleware';

/**
 * Module de Logging Centralisé
 *
 * Ce module fournit une infrastructure de logging structuré et centralisé
 * compatible avec Loki/Grafana pour l'observabilité.
 *
 * Fonctionnalités:
 * - Logs structurés en JSON (compatible Loki)
 * - Correlation ID pour traçabilité des requêtes
 * - Logging automatique des requêtes HTTP
 * - Contexte enrichi (user, service, etc.)
 * - Niveaux de log configurables
 */
@Global()
@Module({
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class LoggingModule {
  /**
   * Configure le middleware de correlation ID
   */
  static getMiddleware() {
    return CorrelationIdMiddleware;
  }
}
