import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Routes exemptées du rate-limiting (scrapers internes, health checks)
const SKIP_PATHS = ['/metrics', '/health'];

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ url?: string }>();
    const url = request.url ?? '';
    if (SKIP_PATHS.some((path) => url.startsWith(path))) {
      return true;
    }
    return super.shouldSkip(context);
  }
}
