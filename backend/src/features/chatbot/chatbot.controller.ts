import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('conversations')
  startConversation(@Body() data: { userId?: string; locale?: string }) {
    console.log('Starting conversation for:', data);
    return {
      conversationId: 'conv_' + Math.random().toString(36).substring(7),
      message: 'Bonjour ! Comment puis-je vous aider ?',
    };
  }

  @Post('message')
  async sendMessage(
    @Body() data: { conversationId: string; message: string; userId?: string },
  ) {
    return this.chatbotService.sendMessage(
      data.conversationId,
      data.message,
      data.userId,
    );
  }

  @Post('escalate')
  escalate(@Body() data: { conversationId: string; reason: string }) {
    return this.chatbotService.escalateToHuman(
      data.conversationId,
      data.reason,
    );
  }
}
