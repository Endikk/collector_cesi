import { Controller, Get, Put, Body, Headers } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import type { UpdatePreferencesDto } from './notification-preferences.service';

@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(
    private notificationPreferencesService: NotificationPreferencesService,
  ) {}

  @Get()
  async getPreferences(@Headers('x-user-id') userId: string) {
    return this.notificationPreferencesService.getPreferences(userId);
  }

  @Put()
  async updatePreferences(
    @Headers('x-user-id') userId: string,
    @Body() data: UpdatePreferencesDto,
  ) {
    return this.notificationPreferencesService.updatePreferences(userId, data);
  }
}
