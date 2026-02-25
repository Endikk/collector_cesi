import { Controller, Post, Body, Param } from '@nestjs/common';
import { StreamingService } from './streaming.service';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Post('events')
  createEvent(
    @Body()
    data: {
      title: string;
      description: string;
      hostId: string;
      scheduledAt: Date;
      items: string[];
    },
  ) {
    return this.streamingService.createEvent(data);
  }

  @Post('events/:id/start')
  startStream(@Param('id') eventId: string) {
    return this.streamingService.startStream(eventId);
  }

  @Post('events/:id/chat')
  sendMessage(
    @Param('id') eventId: string,
    @Body() data: { userId: string; message: string },
  ) {
    return this.streamingService.sendChatMessage(
      eventId,
      data.userId,
      data.message,
    );
  }

  @Post('events/:id/buy')
  purchase(
    @Param('id') eventId: string,
    @Body() data: { itemId: string; buyerId: string },
  ) {
    return this.streamingService.purchaseDuringStream(
      eventId,
      data.itemId,
      data.buyerId,
    );
  }
}
