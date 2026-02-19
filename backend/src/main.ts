import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { SanitizeInterceptor } from './common/sanitize.interceptor';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { JsonLoggerService } from './common/json-logger.service';

async function bootstrap() {
  const httpsOptions = process.env.HTTPS_ENABLED === 'true' ? {
    key: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'cert.pem')),
  } : undefined;

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    logger: new JsonLoggerService(),
  });

  // 🔒 Security: Helmet - Secure HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'js.stripe.com',
            'cdn.jsdelivr.net',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          frameSrc: ["'self'", 'js.stripe.com'],
          connectSrc: ["'self'", 'api.stripe.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Prevent clickjacking
      },
      noSniff: true, // Prevent MIME type sniffing
      xssFilter: true, // Enable XSS filter
    }),
  );

  // 🔒 Security: CORS strict en production
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction
      ? process.env.FRONTEND_URL || 'https://collector.shop'
      : '*', // Permissif en dev
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'], // Pour pagination
  });

  // 🔒 Security: Hide tech stack
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance() as {
    disable?: (key: string) => void;
  };
  if (instance.disable) {
    instance.disable('x-powered-by');
  }

  // 🔒 Security: Sanitize all responses (remove passwords, tokens, etc.)
  app.useGlobalInterceptors(new SanitizeInterceptor());

  // ✅ Validation: Validate all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if non-whitelisted
      transform: true, // Auto-transform to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🔒 Security: Helmet enabled`);
  console.log(
    `🔒 Security: CORS ${isProduction ? 'STRICT' : 'PERMISSIVE'} (${isProduction ? process.env.FRONTEND_URL : '*'})`,
  );
  console.log(`🔒 Security: Response sanitization enabled`);
  console.log(`✅ Validation: Global DTO validation enabled`);
}
void bootstrap();
