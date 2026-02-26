import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { role: string };
      headers: Record<string, string>;
    }>();

    // 1. If JWT auth populated request.user, use it directly
    if (request.user?.role === 'ADMIN') {
      return true;
    }

    // 2. For server-to-server calls (Next.js server actions), verify the
    //    internal API key before trusting the x-user-role header.
    const internalKey = request.headers['x-internal-api-key'];
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (expectedKey && internalKey === expectedKey) {
      const role = request.headers['x-user-role'];
      if (role === 'ADMIN') {
        return true;
      }
    }

    throw new ForbiddenException('Accès réservé aux administrateurs');
  }
}
