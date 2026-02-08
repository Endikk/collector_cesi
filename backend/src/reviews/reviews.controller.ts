import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @Body()
    body: {
      rating: number;
      comment?: string;
      authorId: string;
      transactionId: string;
    },
  ) {
    return this.reviewsService.createReview(body);
  }

  @Get('user/:userId')
  async getReviewsForUser(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsForUser(userId);
  }

  @Get('can-review/:transactionId')
  async canReviewTransaction(
    @Param('transactionId') transactionId: string,
    @Query('userId') userId: string,
  ) {
    return this.reviewsService.canReviewTransaction(transactionId, userId);
  }
}
