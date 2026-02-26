import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role: string }; headers: Record<string, string> }>();

    // Check JWT-populated user first, then fall back to x-user-role header
    // (sent by Next.js server actions after session verification)
    const role = request.user?.role || request.headers['x-user-role'];

    if (!role || role !== 'ADMIN') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    return true;
  }
}
