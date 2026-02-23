import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Nom du header pour le correlation ID
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Symbole pour stocker le correlation ID dans la requête
 */
export const CORRELATION_ID_KEY = Symbol('correlationId');

/**
 * Interface étendue pour Request avec correlation ID
 */
export interface RequestWithCorrelationId extends Request {
  [CORRELATION_ID_KEY]: string;
}

/**
 * Middleware de Correlation ID
 *
 * Ce middleware:
 * - Extrait le correlation ID du header de la requête entrante
 * - Génère un nouveau correlation ID si absent
 * - Attache le correlation ID à la requête pour utilisation dans les logs
 * - Ajoute le correlation ID au header de la réponse
 *
 * Cela permet de tracer une requête à travers tous les services
 * et de corréler les logs dans Loki/Grafana.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Récupère ou génère le correlation ID
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();

    // Attache à la requête
    (req as RequestWithCorrelationId)[CORRELATION_ID_KEY] = correlationId;

    // Ajoute au header de réponse pour traçabilité
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}

/**
 * Helper pour extraire le correlation ID d'une requête
 */
export function getCorrelationId(req: Request): string | undefined {
  return (req as RequestWithCorrelationId)[CORRELATION_ID_KEY];
}
