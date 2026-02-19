import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    PrometheusConfigModule,
    EventBusModule, // Global event bus for modular architecture
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          host: process.env.REDIS_HOST || 'redis',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
        return {
          store,
          ttl: 3600 * 1000, // 1 hour in milliseconds
        };
      },
    }),
    PrismaModule,
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
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule { }
