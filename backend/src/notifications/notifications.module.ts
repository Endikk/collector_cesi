import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationMatchingService } from './notification-matching.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationMatchingService],
  exports: [NotificationsService, NotificationMatchingService],
})
export class NotificationsModule {}
