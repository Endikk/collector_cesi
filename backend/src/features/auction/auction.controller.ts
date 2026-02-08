import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuctionService } from './auction.service';

/**
 * AUCTION CONTROLLER (Future Feature)
 */
@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  createAuction(
    @Body()
    data: {
      itemId: string;
      startPrice: number;
      reservePrice?: number;
      buyNowPrice?: number;
      duration: number;
    },
  ) {
    return this.auctionService.createAuction(data);
  }

  @Get(':id')
  getAuction(@Param('id') id: string) {
    return this.auctionService.getAuction(id);
  }

  @Post(':id/bid')
  async placeBid(
    @Param('id') auctionId: string,
    @Body() data: { bidderId: string; amount: number },
  ) {
    return this.auctionService.placeBid(auctionId, data.bidderId, data.amount);
  }
}
