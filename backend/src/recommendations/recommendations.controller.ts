import { Controller, Get, Headers, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations(
    @Headers('x-user-id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const itemLimit = limit ? parseInt(limit, 10) : 20;
    return this.recommendationsService.getRecommendations(userId, itemLimit);
  }
}
