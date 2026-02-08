import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdvertisingService, AdFeedOptions } from './advertising.service';

@Controller('advertising')
export class AdvertisingController {
  constructor(private readonly advertisingService: AdvertisingService) {}

  /**
   * Get ad feed (JSON format)
   * Requires API key authentication
   */
  @Get('feed')
  async getAdFeed(
    @Headers('x-api-key') apiKey: string,
    @Query('categories') categories?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('limit') limit?: string,
  ) {
    // Validate API key
    const partner = await this.advertisingService.validateApiKey(apiKey);
    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    const options: AdFeedOptions = {
      partnerId: partner.id,
      categories: categories ? categories.split(',') : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
    };

    const items = await this.advertisingService.generateAdFeed(options);

    return {
      partner: partner.name,
      itemCount: items.length,
      items,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get ad feed in XML format
   */
  @Get('feed.xml')
  async getAdFeedXML(
    @Headers('x-api-key') apiKey: string,
    @Query('categories') categories?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('limit') limit?: string,
    @Res() res?: Response,
  ) {
    // Validate API key
    const partner = await this.advertisingService.validateApiKey(apiKey);
    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    const options: AdFeedOptions = {
      partnerId: partner.id,
      categories: categories ? categories.split(',') : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
    };

    const items = await this.advertisingService.generateAdFeed(options);
    const xml = this.advertisingService.generateXMLFeed(items);

    res?.set('Content-Type', 'application/xml');
    return res?.send(xml);
  }

  /**
   * Track impression
   */
  @Post('track/impression')
  async trackImpression(
    @Headers('x-api-key') apiKey: string,
    @Body()
    body: {
      itemId: string;
      campaignId?: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    const partner = await this.advertisingService.validateApiKey(apiKey);
    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.advertisingService.trackImpression({
      partnerId: partner.id,
      ...body,
    });
  }

  /**
   * Track click
   */
  @Post('track/click/:impressionId')
  async trackClick(
    @Headers('x-api-key') apiKey: string,
    @Param('impressionId') impressionId: string,
  ) {
    const partner = await this.advertisingService.validateApiKey(apiKey);
    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.advertisingService.trackClick(impressionId);
  }

  /**
   * Get partner analytics
   */
  @Get('analytics')
  async getAnalytics(
    @Headers('x-api-key') apiKey: string,
    @Query('days') days?: string,
  ) {
    const partner = await this.advertisingService.validateApiKey(apiKey);
    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.advertisingService.getPartnerAnalytics(
      partner.id,
      days ? parseInt(days, 10) : 30,
    );
  }

  /**
   * Create partner (Admin only)
   */
  @Post('partners')
  // @UseGuards(AdminGuard)
  async createPartner(
    @Body()
    body: {
      name: string;
      domain: string;
      apiKey: string;
      webhookUrl?: string;
      trackingPixelUrl?: string;
    },
  ) {
    return this.advertisingService.createPartner(body);
  }

  /**
   * Update partner preferences
   */
  @Put('partners/:partnerId/preferences')
  async updatePreferences(
    @Headers('x-api-key') apiKey: string,
    @Param('partnerId') partnerId: string,
    @Body()
    body: {
      targetCategories?: string[];
      minPrice?: number;
      maxPrice?: number;
      itemConditions?: string[];
      autoSync?: boolean;
      syncFrequency?: number;
      format?: string;
    },
  ) {
    const partner = await this.advertisingService.validateApiKey(apiKey);
    if (!partner || partner.id !== partnerId) {
      throw new UnauthorizedException('Invalid API key or partner mismatch');
    }

    return this.advertisingService.updatePartnerPreferences(partnerId, body);
  }
}
