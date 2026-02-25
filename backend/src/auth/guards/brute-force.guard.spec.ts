import { BruteForceGuard } from './brute-force.guard';
import { Reflector } from '@nestjs/core';
import { HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';

describe('BruteForceGuard', () => {
  let guard: BruteForceGuard;

  beforeEach(() => {
    guard = new BruteForceGuard(new Reflector());
  });

  function createMockContext(ip: string, email?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip,
          headers: {},
          body: email ? { email } : {},
          connection: { remoteAddress: ip },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  describe('canActivate', () => {
    it('should allow request with no prior attempts', () => {
      const context = createMockContext('1.2.3.4', 'test@test.com');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow request without email', () => {
      const context = createMockContext('1.2.3.4');
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should track failed attempts', () => {
      guard.recordFailedAttempt('1.2.3.4', 'test@test.com');
      const stats = guard.getStats();
      expect(stats.ipAttempts).toBe(1);
      expect(stats.emailAttempts).toBe(1);
      expect(stats.combinedAttempts).toBe(1);
    });

    it('should block after too many IP attempts', () => {
      const ip = '1.2.3.4';
      for (let i = 0; i < 5; i++) {
        guard.recordFailedAttempt(ip, `user${i}@test.com`);
      }

      const context = createMockContext(ip, 'new@test.com');
      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });

    it('should block after too many combined attempts', () => {
      const ip = '5.6.7.8';
      const email = 'victim@test.com';
      for (let i = 0; i < 3; i++) {
        guard.recordFailedAttempt(ip, email);
      }

      const context = createMockContext(ip, email);
      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });
  });

  describe('resetAttempts', () => {
    it('should clear all attempt counters', () => {
      guard.recordFailedAttempt('1.2.3.4', 'test@test.com');
      guard.resetAttempts('1.2.3.4', 'test@test.com');

      const stats = guard.getStats();
      expect(stats.ipAttempts).toBe(0);
      expect(stats.emailAttempts).toBe(0);
      expect(stats.combinedAttempts).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return empty stats initially', () => {
      const stats = guard.getStats();
      expect(stats.ipAttempts).toBe(0);
      expect(stats.emailAttempts).toBe(0);
      expect(stats.combinedAttempts).toBe(0);
    });
  });
});
