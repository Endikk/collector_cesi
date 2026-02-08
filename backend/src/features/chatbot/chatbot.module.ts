import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventBusModule } from '../../common/event-bus.module';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { IntentRecognitionService } from './intent-recognition.service';

/**
 * CHATBOT MODULE (Future Feature)
 *
 * AI-powered pre-sales chatbot
 *
 * Features:
 * - Answer common questions
 * - Product recommendations
 * - Order status inquiries
 * - Authentication queries
 * - Item search assistance
 * - Multi-language support (using i18n)
 * - Escalation to human support
 *
 * Tech Stack suggestions:
 * - OpenAI GPT-4 or Claude API
 * - Dialogflow
 * - Custom NLP with TensorFlow.js
 * - Langchain for LLM orchestration
 */
@Module({
  imports: [
    PrismaModule,
    EventBusModule,
    // OpenAIModule, (GPT integration)
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, IntentRecognitionService],
  exports: [ChatbotService],
})
export class ChatbotModule {}

/**
 * USAGE:
 *
 * 1. Add to app.module.ts
 *
 * 2. Add Prisma models:
 *    model ChatConversation {
 *      id        String   @id @default(cuid())
 *      userId    String?  // null for anonymous
 *      locale    String   @default("fr")
 *      startedAt DateTime @default(now())
 *      endedAt   DateTime?
 *      resolved  Boolean  @default(false)
 *      messages  ChatMessage[]
 *    }
 *
 *    model ChatMessage {
 *      id             String @id @default(cuid())
 *      conversationId String
 *      role           String // "user" | "bot" | "agent"
 *      content        String @db.Text
 *      intent         String?
 *      timestamp      DateTime @default(now())
 *    }
 *
 * 3. Environment variables:
 *    OPENAI_API_KEY=sk-...
 *    CHATBOT_MODEL=gpt-4
 *    CHATBOT_TEMPERATURE=0.7
 *
 * 4. API endpoints:
 *    POST /chatbot/conversations      - Start conversation
 *    POST /chatbot/message            - Send message
 *    GET  /chatbot/conversations/:id  - Get conversation
 *    POST /chatbot/escalate           - Escalate to human
 *
 * 5. Integration examples:
 *    - Embed chat widget on all pages
 *    - Proactive chat suggestions based on user behavior
 *    - Product recommendations using browsing history
 */
