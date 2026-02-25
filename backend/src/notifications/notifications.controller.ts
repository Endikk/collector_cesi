import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationMatchingService } from './notification-matching.service';

interface TriggerNotificationDto {
  itemId: string;
  title: string;
  description: string;
  price: number;
  categoryId: string | null;
  ownerId: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationMatchingService: NotificationMatchingService,
  ) {}

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const unreadOnlyBool = unreadOnly === 'true';
    return this.notificationsService.getUserNotifications(
      userId,
      unreadOnlyBool,
    );
  }

  @Get('user/:userId/count')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Post(':notificationId/read')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @Body('userId') userId: string,
  ) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  @Post('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @Body('userId') userId: string,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }

  @Post()
  async createNotification(
    @Body() body: { userId: string; type: string; data?: string },
  ) {
    return this.notificationsService.createNotification(body);
  }

  @Post('trigger-new-item')
  async triggerNewItemNotifications(@Body() dto: TriggerNotificationDto) {
    try {
      // Map itemId to id for the service
      const itemData = {
        id: dto.itemId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        ownerId: dto.ownerId,
      };
      await this.notificationMatchingService.notifyNewItem(itemData);
      return { success: true, message: 'Notifications triggered' };
    } catch (error) {
      console.error('Error triggering notifications:', error);
      return { success: false, message: 'Failed to trigger notifications' };
    }
  }
}
