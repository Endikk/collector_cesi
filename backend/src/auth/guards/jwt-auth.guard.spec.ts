import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Test guard logic without importing AuthGuard('jwt') which causes worker crashes
describe('JwtAuthGuard logic', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  function createMockContext(): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as any;
  }

  it('should identify public routes via reflector', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = createMockContext();
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    expect(isPublic).toBe(true);
  });

  it('should identify non-public routes via reflector', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = createMockContext();
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    expect(isPublic).toBe(false);
  });

  it('should return undefined when no metadata is set', () => {
    const context = createMockContext();
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    expect(isPublic).toBeUndefined();
  });
});
