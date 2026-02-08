import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import type { CreateInterestDto } from './interests.service';

@Controller('interests')
export class InterestsController {
  constructor(private interestsService: InterestsService) {}

  @Get('user/:userId')
  async getUserInterests(@Param('userId') userId: string) {
    return this.interestsService.getUserInterests(userId);
  }

  @Post()
  async createInterest(
    @Headers('x-user-id') userId: string,
    @Body() data: CreateInterestDto,
  ) {
    return this.interestsService.createInterest(userId, data);
  }

  @Put(':id')
  async updateInterest(
    @Param('id') interestId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateInterestDto,
  ) {
    return this.interestsService.updateInterest(interestId, userId, data);
  }

  @Delete(':id')
  async deleteInterest(
    @Param('id') interestId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.interestsService.deleteInterest(interestId, userId);
  }
}
