import { Controller, Post, Body } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('check')
  checkContent(@Body() body: { content: string }) {
    return this.moderationService.canSendMessage(body.content);
  }

  @Post('moderate')
  moderateContent(@Body() body: { content: string }) {
    return this.moderationService.moderateContent(body.content);
  }
}
