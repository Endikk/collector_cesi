import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventBusModule } from '../../common/event-bus.module';
import { StreamingService } from './streaming.service';
import { StreamingController } from './streaming.controller';
import { StreamEventHandler } from './stream-event.handler';

/**
 * STREAMING MODULE (Future Feature)
 *
 * Live streaming events for collectors
 *
 * Features:
 * - Live video streaming (via WebRTC or HLS)
 * - Real-time chat during stream
 * - Live product showcase
 * - Instant purchase during stream
 * - Stream recording and replay
 * - Viewer analytics
 * - Scheduled events
 *
 * Tech Stack suggestions:
 * - Video: Agora.io, AWS IVS, or Mux
 * - Chat: Socket.io or WebSocket
 * - CDN: Cloudflare Stream
 */
@Module({
  imports: [
    PrismaModule,
    EventBusModule,
    // WebSocketModule,
    // VideoStreamModule, (Agora/AWS IVS integration)
  ],
  controllers: [StreamingController],
  providers: [StreamingService, StreamEventHandler],
  exports: [StreamingService],
})
export class StreamingModule {}

/**
 * USAGE:
 *
 * 1. Add to app.module.ts
 *
 * 2. Add Prisma models:
 *    model StreamEvent {
 *      id          String   @id @default(cuid())
 *      title       String
 *      description String?
 *      hostId      String
 *      scheduledAt DateTime
 *      startedAt   DateTime?
 *      endedAt     DateTime?
 *      status      String   @default("SCHEDULED")
 *      streamKey   String   @unique
 *      viewerCount Int      @default(0)
 *      items       StreamItem[]
 *      messages    StreamMessage[]
 *    }
 *
 *    model StreamItem {
 *      id        String @id @default(cuid())
 *      streamId  String
 *      itemId    String
 *      showOrder Int
 *      sold      Boolean @default(false)
 *    }
 *
 *    model StreamMessage {
 *      id        String   @id @default(cuid())
 *      streamId  String
 *      userId    String
 *      message   String
 *      timestamp DateTime @default(now())
 *    }
 *
 * 3. API endpoints:
 *    POST   /streaming/events          - Create event
 *    GET    /streaming/events          - List events
 *    POST   /streaming/events/:id/start - Start stream
 *    POST   /streaming/events/:id/end   - End stream
 *    GET    /streaming/events/:id/chat  - Get chat messages
 *    POST   /streaming/events/:id/chat  - Send message
 *    POST   /streaming/events/:id/buy   - Purchase during stream
 *
 * 4. WebSocket events:
 *    - stream:started
 *    - stream:ended
 *    - stream:message
 *    - stream:purchase
 *    - stream:viewerCount
 */
