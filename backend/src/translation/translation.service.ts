import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TranslationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get translation for a specific key and locale
   */
  async getTranslation(key: string, locale: string): Promise<string | null> {
    const translation = await this.prisma.translation.findUnique({
      where: {
        key_locale: {
          key,
          locale,
        },
      },
    });

    return translation?.value || null;
  }

  /**
   * Get all translations for a locale
   */
  async getTranslations(locale: string, context?: string) {
    const where: Prisma.TranslationWhereInput = { locale };
    if (context) {
      where.context = context;
    }

    const translations = await this.prisma.translation.findMany({
      where,
      select: {
        key: true,
        value: true,
        context: true,
      },
    });

    // Convert to key-value object
    return translations.reduce(
      (acc, t) => {
        acc[t.key] = t.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * Create or update a translation
   */
  async upsertTranslation(data: {
    key: string;
    locale: string;
    value: string;
    context?: string;
  }) {
    return this.prisma.translation.upsert({
      where: {
        key_locale: {
          key: data.key,
          locale: data.locale,
        },
      },
      create: data,
      update: {
        value: data.value,
        context: data.context,
      },
    });
  }

  /**
   * Bulk import translations
   */
  async bulkImportTranslations(
    locale: string,
    translations: Record<string, string>,
    context?: string,
  ) {
    const operations = Object.entries(translations).map(([key, value]) =>
      this.prisma.translation.upsert({
        where: {
          key_locale: { key, locale },
        },
        create: {
          key,
          locale,
          value,
          context,
        },
        update: {
          value,
        },
      }),
    );

    await this.prisma.$transaction(operations);
    return { count: operations.length };
  }

  /**
   * Delete a translation
   */
  async deleteTranslation(key: string, locale: string) {
    return this.prisma.translation.delete({
      where: {
        key_locale: { key, locale },
      },
    });
  }

  /**
   * Get all available locales
   */
  async getAvailableLocales() {
    const locales = await this.prisma.translation.findMany({
      select: { locale: true },
      distinct: ['locale'],
    });

    return locales.map((l) => l.locale);
  }

  /**
   * Get translation coverage (percentage of translated keys per locale)
   */
  async getTranslationCoverage() {
    const locales = await this.getAvailableLocales();
    const coverage: Record<string, { total: number; percentage: number }> = {};

    // Get total unique keys
    const totalKeys = await this.prisma.translation.findMany({
      select: { key: true },
      distinct: ['key'],
    });

    const totalCount = totalKeys.length;

    for (const locale of locales) {
      const localeCount = await this.prisma.translation.count({
        where: { locale },
      });

      coverage[locale] = {
        total: localeCount,
        percentage: totalCount > 0 ? (localeCount / totalCount) * 100 : 0,
      };
    }

    return coverage;
  }
}
