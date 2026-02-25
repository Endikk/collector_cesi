import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventBusModule } from '../../common/event-bus.module';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { BidService } from './bid.service';
import { AuctionEventHandler } from './auction-event.handler';

/**
 * AUCTION MODULE (Future Feature)
 *
 * Example of modular feature that can be added without modifying existing code
 *
 * Features:
 * - Timed auctions (auction de durée limitée)
 * - Automatic bidding (enchères automatiques)
 * - Real-time bid notifications (via WebSocket)
 * - Anti-sniping (extension automatique si enchère de dernière minute)
 * - Reserve price (prix de réserve)
 * - Buy now option (achat immédiat)
 */
@Module({
  imports: [
    PrismaModule,
    EventBusModule,
    // WebSocketModule, // For real-time bidding
  ],
  controllers: [AuctionController],
  providers: [AuctionService, BidService, AuctionEventHandler],
  exports: [AuctionService],
})
export class AuctionModule {}

/**
 * USAGE EXAMPLE:
 *
 * 1. Add to app.module.ts:
 *    imports: [...existing, AuctionModule]
 *
 * 2. Add Prisma models:
 *    model Auction {
 *      id           String   @id @default(cuid())
 *      itemId       String   @unique
 *      startPrice   Float
 *      reservePrice Float?
 *      buyNowPrice  Float?
 *      startTime    DateTime
 *      endTime      DateTime
 *      status       String   @default("PENDING")
 *      winnerId     String?
 *      bids         Bid[]
 *    }
 *
 *    model Bid {
 *      id          String   @id @default(cuid())
 *      auctionId   String
 *      bidderId    String
 *      amount      Float
 *      maxAmount   Float?   // For automatic bidding
 *      timestamp   DateTime @default(now())
 *      status      String   @default("ACTIVE")
 *    }
 *
 * 3. Run: npx prisma db push
 *
 * 4. API endpoints automatically available:
 *    POST   /auctions              - Create auction
 *    GET    /auctions              - List auctions
 *    GET    /auctions/:id          - Auction details
 *    POST   /auctions/:id/bid      - Place bid
 *    GET    /auctions/:id/bids     - Bid history
 *    DELETE /auctions/:id          - Cancel auction (if no bids)
 *
 * 5. WebSocket events:
 *    - auction:newBid
 *    - auction:ended
 *    - auction:outbid
 */

/**
 * Integration with existing system:
 *
 * - Item status can be "AUCTION" in addition to "AVAILABLE", "SOLD"
 * - Notifications sent when outbid
 * - Transactions created automatically when auction ends
 * - Fraud detection monitors suspicious bidding patterns
 * - Analytics track auction performance
 *
 * No changes needed to existing code - fully isolated module!
 */
