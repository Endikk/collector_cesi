import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { SanitizeInterceptor } from './common/sanitize.interceptor';
import { ZodValidationPipe } from './common/zod-validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

import { LoggerService } from './logging';

async function bootstrap() {
  const httpsOptions =
    process.env.HTTPS_ENABLED === 'true'
      ? {
          key: fs.readFileSync(
            path.join(__dirname, '..', 'secrets', 'key.pem'),
          ),
          cert: fs.readFileSync(
            path.join(__dirname, '..', 'secrets', 'cert.pem'),
          ),
        }
      : undefined;

  // Initialisation du logger centralisé
  const logger = new LoggerService();
  logger.setContext('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    logger,
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-role'],
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

  // ✅ Validation: Zod schema validation for all DTOs
  app.useGlobalPipes(new ZodValidationPipe());

  // 📚 API Documentation: Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Collector API')
    .setDescription(
      `API de la marketplace Collector - Vente d'objets de collection entre particuliers.

## Authentification
L'API utilise JWT Bearer tokens. Obtenez un token via \`/auth/login\` puis ajoutez-le dans le header Authorization.

## Rate Limiting
- 10 requêtes par minute par IP (global)
- Certains endpoints ont des limites spécifiques

## Codes d'erreur
- 400: Bad Request - Données invalides
- 401: Unauthorized - Token manquant ou invalide
- 403: Forbidden - Accès refusé
- 404: Not Found - Ressource introuvable
- 429: Too Many Requests - Rate limit atteint`,
    )
    .setVersion('1.0')
    .setContact(
      'Collector Team',
      'https://collector.shop',
      'support@collector.shop',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre JWT token',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentification et gestion des sessions')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('items', 'Gestion des articles')
    .addTag('shops', 'Gestion des boutiques')
    .addTag('payments', 'Paiements Stripe')
    .addTag('notifications', 'Notifications utilisateur')
    .addTag('admin', 'Administration')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Collector API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const protocol = httpsOptions ? 'https' : 'http';
  logger.log(`Backend running on ${protocol}://0.0.0.0:${port}`);
  logger.log(`Security: HTTPS ${httpsOptions ? 'ENABLED' : 'DISABLED'}`);
  logger.log('Security: Helmet enabled');
  logger.log(
    `Security: CORS ${isProduction ? 'STRICT' : 'PERMISSIVE'} (${isProduction ? process.env.FRONTEND_URL : '*'})`,
  );
  logger.log('Security: Response sanitization enabled');
  logger.log('Validation: Zod schema validation enabled');
  logger.log('Logging: Centralized logging with Loki support enabled');
  logger.log(
    `API Documentation: Swagger available at ${protocol}://0.0.0.0:${port}/api/docs`,
  );
}
void bootstrap();
