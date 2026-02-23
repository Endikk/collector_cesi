import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';

/**
 * Niveaux de log supportés
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Contexte d'un log
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  service?: string;
  method?: string;
  path?: string;
  duration?: number;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

/**
 * Structure d'un log JSON (compatible Loki)
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  version: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Service de Logging Centralisé
 *
 * Génère des logs structurés en JSON pour être collectés par Promtail
 * et envoyés à Loki pour visualisation dans Grafana.
 *
 * Labels Loki générés:
 * - app: collector-backend
 * - environment: dev/staging/production
 * - level: debug/info/warn/error/fatal
 * - service: nom du service/module
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private correlationId?: string;
  private readonly serviceName = 'collector-backend';
  private readonly environment = process.env.NODE_ENV || 'development';
  private readonly version = process.env.APP_VERSION || '1.0.0';
  private readonly minLevel: LogLevel;

  constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug';
  }

  /**
   * Définit le contexte par défaut pour ce logger
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Définit le correlation ID pour tracer les requêtes
   */
  setCorrelationId(correlationId: string): this {
    this.correlationId = correlationId;
    return this;
  }

  /**
   * Crée un logger enfant avec un contexte spécifique
   */
  child(context: string, correlationId?: string): LoggerService {
    const childLogger = new LoggerService();
    childLogger.setContext(context);
    if (correlationId || this.correlationId) {
      childLogger.setCorrelationId(correlationId || this.correlationId!);
    }
    return childLogger;
  }

  /**
   * Log niveau INFO
   */
  log(message: string, context?: string | LogContext): void {
    this.writeLog('info', message, context);
  }

  /**
   * Log niveau ERROR
   */
  error(message: string | Error, trace?: string, context?: string | LogContext): void {
    const errorInfo = message instanceof Error ? message : undefined;
    const msg = message instanceof Error ? message.message : message;
    this.writeLog('error', msg, context, errorInfo, trace);
  }

  /**
   * Log niveau WARN
   */
  warn(message: string, context?: string | LogContext): void {
    this.writeLog('warn', message, context);
  }

  /**
   * Log niveau DEBUG
   */
  debug(message: string, context?: string | LogContext): void {
    this.writeLog('debug', message, context);
  }

  /**
   * Log niveau VERBOSE (mapped to debug)
   */
  verbose(message: string, context?: string | LogContext): void {
    this.writeLog('debug', message, context);
  }

  /**
   * Log niveau FATAL
   */
  fatal(message: string, context?: string | LogContext): void {
    this.writeLog('fatal', message, context);
  }

  /**
   * Log une requête HTTP entrante
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: Partial<LogContext>,
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${path} ${statusCode} - ${duration}ms`;

    this.writeLog(level, message, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    } as LogContext);
  }

  /**
   * Log un événement métier
   */
  logBusinessEvent(event: string, data: Record<string, unknown>, context?: Partial<LogContext>): void {
    this.writeLog('info', `[BUSINESS_EVENT] ${event}`, {
      ...context,
      event,
      eventData: data,
    } as LogContext);
  }

  /**
   * Log une action de sécurité
   */
  logSecurity(action: string, details: Record<string, unknown>, context?: Partial<LogContext>): void {
    this.writeLog('warn', `[SECURITY] ${action}`, {
      ...context,
      securityAction: action,
      securityDetails: details,
    } as LogContext);
  }

  /**
   * Log une métrique de performance
   */
  logPerformance(operation: string, duration: number, context?: Partial<LogContext>): void {
    const level: LogLevel = duration > 1000 ? 'warn' : 'debug';
    this.writeLog(level, `[PERF] ${operation}: ${duration}ms`, {
      ...context,
      operation,
      duration,
    } as LogContext);
  }

  /**
   * Écrit le log au format JSON
   */
  private writeLog(
    level: LogLevel,
    message: string,
    context?: string | LogContext,
    error?: Error,
    trace?: string,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logContext: LogContext =
      typeof context === 'string' ? { service: context } : context || {};

    // Ajoute le correlation ID si disponible
    if (this.correlationId) {
      logContext.correlationId = this.correlationId;
    }

    // Ajoute le contexte par défaut
    if (this.context && !logContext.service) {
      logContext.service = this.context;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      environment: this.environment,
      version: this.version,
    };

    if (Object.keys(logContext).length > 0) {
      entry.context = logContext;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: trace || error.stack,
      };
    }

    const output = JSON.stringify(entry);

    // Sortie sur le flux approprié
    switch (level) {
      case 'error':
      case 'fatal':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * Vérifie si le niveau de log doit être affiché
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }
}
