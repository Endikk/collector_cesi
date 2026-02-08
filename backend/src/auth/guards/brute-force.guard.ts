import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BruteForceGuard implements CanActivate {
  private ipAttempts = new Map<string, { count: number; resetAt: Date }>();
  private emailAttempts = new Map<string, { count: number; resetAt: Date }>();
  private combinedAttempts = new Map<
    string,
    { count: number; resetAt: Date }
  >();

  private readonly IP_MAX_ATTEMPTS = 5;
  private readonly EMAIL_MAX_ATTEMPTS = 10;
  private readonly COMBINED_MAX_ATTEMPTS = 3;
  private readonly BLOCK_DURATION_MS = 15 * 60 * 1000;

  constructor(private reflector: Reflector) {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const ip = this.getIpAddress(request as Record<string, unknown>);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const email = request.body?.email;

    if (!email || typeof email !== 'string') {
      return this.checkIpAttempts(ip);
    }

    const combinedKey = `${ip}:${email.toLowerCase()}`;
    this.checkIpAttempts(ip);
    this.checkEmailAttempts(email);
    this.checkCombinedAttempts(combinedKey);

    return true;
  }

  recordFailedAttempt(ip: string, email: string) {
    const now = new Date();
    const combinedKey = `${ip}:${email.toLowerCase()}`;

    this.incrementAttempts(this.ipAttempts, ip, now);
    this.incrementAttempts(this.emailAttempts, email.toLowerCase(), now);
    this.incrementAttempts(this.combinedAttempts, combinedKey, now);

    console.warn(
      `Failed login: IP=${ip}, Email=${email}, Attempts=${this.ipAttempts.get(ip)?.count || 0}`,
    );
  }

  resetAttempts(ip: string, email: string) {
    const combinedKey = `${ip}:${email.toLowerCase()}`;
    this.ipAttempts.delete(ip);
    this.emailAttempts.delete(email.toLowerCase());
    this.combinedAttempts.delete(combinedKey);
  }

  private checkIpAttempts(ip: string): boolean {
    const attempts = this.ipAttempts.get(ip);

    if (attempts && attempts.count >= this.IP_MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil(
        (attempts.resetAt.getTime() - Date.now()) / 60000,
      );

      if (minutesLeft > 0) {
        const message = `Too many login attempts from this IP. Try again in ${minutesLeft} min.`;
        throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
      } else {
        this.ipAttempts.delete(ip);
      }
    }

    return true;
  }

  private checkEmailAttempts(email: string): boolean {
    const attempts = this.emailAttempts.get(email);

    if (attempts && attempts.count >= this.EMAIL_MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil(
        (attempts.resetAt.getTime() - Date.now()) / 60000,
      );

      if (minutesLeft > 0) {
        const message = `Too many login attempts. Try again in ${minutesLeft} min or reset password.`;
        throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
      } else {
        this.emailAttempts.delete(email);
      }
    }

    return true;
  }

  private checkCombinedAttempts(combinedKey: string): boolean {
    const attempts = this.combinedAttempts.get(combinedKey);

    if (attempts && attempts.count >= this.COMBINED_MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil(
        (attempts.resetAt.getTime() - Date.now()) / 60000,
      );

      if (minutesLeft > 0) {
        const message = `Too many failed login attempts. Try again in ${minutesLeft} min.`;
        throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
      } else {
        this.combinedAttempts.delete(combinedKey);
      }
    }

    return true;
  }

  private incrementAttempts(
    storage: Map<string, { count: number; resetAt: Date }>,
    key: string,
    now: Date,
  ) {
    const existing = storage.get(key);

    if (existing) {
      existing.count++;
    } else {
      storage.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + this.BLOCK_DURATION_MS),
      });
    }
  }

  private getIpAddress(request: Record<string, unknown>): string {
    const headers =
      (request.headers as Record<string, string | string[]>) || {};
    const forwardedFor = headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp;
    }

    const connection = (request.connection as { remoteAddress?: string }) || {};
    const ip = (request.ip as string) || '';
    return connection.remoteAddress || ip || 'unknown';
  }

  private cleanup() {
    const now = Date.now();

    for (const [key, value] of this.ipAttempts.entries()) {
      if (value.resetAt.getTime() < now) {
        this.ipAttempts.delete(key);
      }
    }

    for (const [key, value] of this.emailAttempts.entries()) {
      if (value.resetAt.getTime() < now) {
        this.emailAttempts.delete(key);
      }
    }

    for (const [key, value] of this.combinedAttempts.entries()) {
      if (value.resetAt.getTime() < now) {
        this.combinedAttempts.delete(key);
      }
    }
  }

  getStats() {
    return {
      ipAttempts: this.ipAttempts.size,
      emailAttempts: this.emailAttempts.size,
      combinedAttempts: this.combinedAttempts.size,
    };
  }
}
