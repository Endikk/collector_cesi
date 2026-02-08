import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TranslationService } from './translation.service';

// Note: Add proper auth guards in production
@Controller('translations')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  /**
   * Get translation for specific key and locale
   */
  @Get(':locale/:key')
  async getTranslation(
    @Param('locale') locale: string,
    @Param('key') key: string,
  ) {
    const value = await this.translationService.getTranslation(key, locale);
    return { key, locale, value };
  }

  /**
   * Get all translations for a locale
   */
  @Get(':locale')
  async getTranslations(
    @Param('locale') locale: string,
    @Query('context') context?: string,
  ) {
    const translations = await this.translationService.getTranslations(
      locale,
      context,
    );
    return { locale, translations };
  }

  /**
   * Get available locales
   */
  @Get()
  async getLocales() {
    const locales = await this.translationService.getAvailableLocales();
    return { locales };
  }

  /**
   * Create or update translation
   */
  @Put()
  // @UseGuards(AdminGuard) // Add admin guard
  async upsertTranslation(
    @Body()
    body: {
      key: string;
      locale: string;
      value: string;
      context?: string;
    },
  ) {
    return this.translationService.upsertTranslation(body);
  }

  /**
   * Bulk import translations
   */
  @Post(':locale/bulk')
  // @UseGuards(AdminGuard)
  async bulkImport(
    @Param('locale') locale: string,
    @Body()
    body: {
      translations: Record<string, string>;
      context?: string;
    },
  ) {
    return this.translationService.bulkImportTranslations(
      locale,
      body.translations,
      body.context,
    );
  }

  /**
   * Delete translation
   */
  @Delete(':locale/:key')
  // @UseGuards(AdminGuard)
  async deleteTranslation(
    @Param('locale') locale: string,
    @Param('key') key: string,
  ) {
    return this.translationService.deleteTranslation(key, locale);
  }

  /**
   * Get translation coverage stats
   */
  @Get('stats/coverage')
  // @UseGuards(AdminGuard)
  async getCoverage() {
    return this.translationService.getTranslationCoverage();
  }
}
