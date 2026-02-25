import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RedisCacheModule } from './cache';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/throttler.guard';

import { HttpMetricsInterceptor } from './common/http-metrics.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ShopsModule } from './shops/shops.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InterestsModule } from './interests/interests.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { EmailModule } from './email/email.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { PaymentModule } from './payment/payment.module';
import { ModerationModule } from './moderation/moderation.module';
import { ValidationModule } from './validation/validation.module';
import { FraudDetectionModule } from './fraud-detection/fraud-detection.module';
import { ItemsModule } from './items/items.module';
import { TranslationModule } from './translation/translation.module';
import { AdvertisingModule } from './advertising/advertising.module';
import { EventBusModule } from './common/event-bus.module';
import { ConfigModule } from '@nestjs/config';
import { PrometheusConfigModule } from './common/prometheus.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { LoggingModule, CorrelationIdMiddleware } from './logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    PrometheusConfigModule,
    LoggingModule, // Centralized logging with Loki support
    EventBusModule, // Global event bus for modular architecture
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '10'),
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    RedisCacheModule, // Direct ioredis cache (replaces deprecated cache-manager)
    PrismaModule,
    AuthModule,
    UsersModule,
    ShopsModule,
    AdminModule,
    ReviewsModule,
    NotificationsModule,
    InterestsModule,
    RecommendationsModule,
    EmailModule,
    NotificationPreferencesModule,
    PaymentModule,
    FraudDetectionModule,
    ItemsModule,
    ModerationModule,
    ValidationModule,
    TranslationModule,
    AdvertisingModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure le middleware de correlation ID pour toutes les routes
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*splat', method: RequestMethod.ALL });
  }
}
