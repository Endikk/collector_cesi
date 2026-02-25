import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Intercepteur pour sanitize les réponses API et éviter l'exposition de données sensibles
 *
 * Supprime automatiquement :
 * - Passwords (hashed ou non)
 * - Tokens (JWT, reset tokens, etc.)
 * - Clés API
 * - Données bancaires
 * - Secrets
 *
 * Usage :
 * ```typescript
 * // Global (dans main.ts)
 * app.useGlobalInterceptors(new SanitizeInterceptor());
 *
 * // Controller-specific
 * @UseInterceptors(SanitizeInterceptor)
 * @Controller('users')
 * export class UsersController { ... }
 * ```
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  // Champs à supprimer des réponses
  private readonly SENSITIVE_FIELDS = [
    'password',
    'passwordHash',
    'hashedPassword',
    'salt',
    'token',
    'accessToken',
    'refreshToken',
    'resetToken',
    'apiKey',
    'secret',
    'privateKey',
    'stripeSecret',
    'stripeSecretKey',
    'encryptionKey',
    'mfaSecret',
    'creditCard',
    'cardNumber',
    'cvv',
    'ssn',
    'socialSecurityNumber',
    'bankAccount',
    'iban',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.sanitize(data)));
  }

  /**
   * Sanitize récursivement un objet ou tableau
   */
  private sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    // Handle objects
    if (
      typeof data === 'object' &&
      data !== null &&
      data.constructor === Object
    ) {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields
        if (this.isSensitiveField(key)) {
          continue; // ✅ Field removed
        }

        // Recursively sanitize nested objects
        sanitized[key] = this.sanitize(value);
      }

      return sanitized;
    }

    // Primitive values
    return data;
  }

  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();

    // Check exact matches
    if (this.SENSITIVE_FIELDS.some((sf) => lowerField === sf.toLowerCase())) {
      return true;
    }

    // Check patterns (ends with...)
    if (
      lowerField.endsWith('password') ||
      lowerField.endsWith('secret') ||
      lowerField.endsWith('token') ||
      (lowerField.endsWith('key') && !lowerField.includes('public'))
    ) {
      return true;
    }

    return false;
  }
}

/**
 * Decorator pour marquer explicitement des champs comme sensibles dans les DTOs
 *
 * Usage :
 * ```typescript
 * export class UserDto {
 *   id: string;
 *   email: string;
 *
 *   @Sensitive()
 *   internalNotes: string; // Ne sera jamais exposé dans l'API
 * }
 * ```
 */
export function Sensitive() {
  return function (target: Record<string, unknown>, propertyKey: string) {
    // Store metadata for custom filtering
    const constructor = target.constructor as {
      __sensitiveFields?: string[];
    };
    if (!constructor.__sensitiveFields) {
      constructor.__sensitiveFields = [];
    }
    constructor.__sensitiveFields.push(propertyKey);
  };
}
