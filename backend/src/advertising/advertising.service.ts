import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface AdFeedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  itemUrl: string;
  category: string;
  condition?: string;
  availability: 'in_stock' | 'out_of_stock';
  brand?: string;
  seller: {
    id: string;
    name: string;
    rating?: number;
  };
}

export interface AdFeedOptions {
  partnerId?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  format?: 'JSON' | 'XML' | 'RSS';
}

@Injectable()
export class AdvertisingService {
  private readonly logger = new Logger(AdvertisingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate advertising feed for partners
   */
  async generateAdFeed(options: AdFeedOptions = {}): Promise<AdFeedItem[]> {
    const { partnerId, categories, minPrice, maxPrice, limit = 100 } = options;

    // Build query conditions
    const where: Prisma.ItemWhereInput = {
      status: 'AVAILABLE',
      validationStatus: 'APPROVED',
      published: true,
    };

    // Initialize price filter
    const priceFilter: Prisma.FloatFilter = {};

    if (minPrice !== undefined) {
      priceFilter.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      priceFilter.lte = maxPrice;
    }

    if (Object.keys(priceFilter).length > 0) {
      where.price = priceFilter;
    }

    // Apply partner preferences if partnerId provided
    if (partnerId) {
      const partner = await this.prisma.advertisingPartner.findUnique({
        where: { id: partnerId },
        include: { preferences: true },
      });

      if (partner?.preferences) {
        const prefs = partner.preferences;

        if (prefs.targetCategories.length > 0) {
          where.categoryId = { in: prefs.targetCategories };
        }

        if (prefs.minPrice !== null || prefs.maxPrice !== null) {
          const prefPriceFilter: Prisma.FloatFilter = {};
          if (prefs.minPrice !== null) {
            prefPriceFilter.gte = prefs.minPrice;
          }
          if (prefs.maxPrice !== null) {
            prefPriceFilter.lte = prefs.maxPrice;
          }
          where.price = prefPriceFilter;
        }
      }
    } else if (categories && categories.length > 0) {
      where.categoryId = { in: categories };
    }

    // Fetch items
    const items = await this.prisma.item.findMany({
      where,
      take: limit,
      orderBy: [
        { viewCount: 'desc' }, // Prioritize popular items
        { createdAt: 'desc' },
      ],
      include: {
        images: true,
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform to AdFeedItem format
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      currency: 'EUR',
      imageUrl: item.images[0]?.url || '',
      itemUrl: `${process.env.FRONTEND_URL || 'https://collector.shop'}/items/${item.id}`,
      category: item.category?.name || 'Uncategorized',
      condition: item.status,
      availability: item.status === 'AVAILABLE' ? 'in_stock' : 'out_of_stock',
      seller: {
        id: item.owner.id,
        name: item.owner.name || item.owner.email,
      },
    }));
  }

  /**
   * Generate XML feed format
   */
  generateXMLFeed(items: AdFeedItem[]): string {
    const xmlItems = items
      .map(
        (item) => `
    <item>
      <id>${this.escapeXml(item.id)}</id>
      <title>${this.escapeXml(item.title)}</title>
      <description>${this.escapeXml(item.description)}</description>
      <price>${item.price} ${item.currency}</price>
      <link>${this.escapeXml(item.itemUrl)}</link>
      <image_link>${this.escapeXml(item.imageUrl)}</image_link>
      <category>${this.escapeXml(item.category)}</category>
      <availability>${item.availability}</availability>
      <condition>${this.escapeXml(item.condition || 'used')}</condition>
      <seller_id>${this.escapeXml(item.seller.id)}</seller_id>
      <seller_name>${this.escapeXml(item.seller.name)}</seller_name>
    </item>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Collector.shop Product Feed</title>
    <link>https://collector.shop</link>
    <description>Marketplace pour collectionneurs</description>
    ${xmlItems}
  </channel>
</rss>`;
  }

  /**
   * Track ad impression
   */
  async trackImpression(data: {
    partnerId: string;
    itemId: string;
    campaignId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.adImpression.create({
      data,
    });
  }

  /**
   * Track ad click
   */
  async trackClick(impressionId: string) {
    return this.prisma.adImpression.update({
      where: { id: impressionId },
      data: { clicked: true },
    });
  }

  /**
   * Get advertising analytics for partner
   */
  async getPartnerAnalytics(partnerId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const impressions = await this.prisma.adImpression.count({
      where: {
        partnerId,
        createdAt: { gte: since },
      },
    });

    const clicks = await this.prisma.adImpression.count({
      where: {
        partnerId,
        clicked: true,
        createdAt: { gte: since },
      },
    });

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    // Get top performing items
    const topItems = await this.prisma.adImpression.groupBy({
      by: ['itemId'],
      where: {
        partnerId,
        createdAt: { gte: since },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    return {
      period: `Last ${days} days`,
      impressions,
      clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      topItems: topItems.map((item) => ({
        itemId: item.itemId,
        impressions: item._count.id,
      })),
    };
  }

  /**
   * Create advertising partner
   */
  async createPartner(data: {
    name: string;
    domain: string;
    apiKey: string;
    webhookUrl?: string;
    trackingPixelUrl?: string;
  }) {
    return this.prisma.advertisingPartner.create({
      data,
    });
  }

  /**
   * Update partner preferences
   */
  async updatePartnerPreferences(
    partnerId: string,
    preferences: {
      targetCategories?: string[];
      minPrice?: number;
      maxPrice?: number;
      itemConditions?: string[];
      autoSync?: boolean;
      syncFrequency?: number;
      format?: string;
    },
  ) {
    return this.prisma.partnerPreferences.upsert({
      where: { partnerId },
      create: {
        partnerId,
        targetCategories: preferences.targetCategories || [],
        minPrice: preferences.minPrice,
        maxPrice: preferences.maxPrice,
        itemConditions: preferences.itemConditions || [],
        autoSync: preferences.autoSync ?? true,
        syncFrequency: preferences.syncFrequency ?? 3600,
        format: preferences.format || 'JSON',
      },
      update: preferences,
    });
  }

  /**
   * Validate partner API key
   */
  async validateApiKey(apiKey: string) {
    const partner = await this.prisma.advertisingPartner.findUnique({
      where: { apiKey },
    });

    return partner?.active ? partner : null;
  }

  /**
   * Notify partner of new items (webhook)
   */
  async notifyPartnerNewItem(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        category: true,
        owner: true,
      },
    });

    if (!item || item.status !== 'AVAILABLE' || !item.published) {
      return;
    }

    // Find partners with auto-sync enabled and matching preferences
    const partners = await this.prisma.advertisingPartner.findMany({
      where: {
        active: true,
        webhookUrl: { not: null },
        preferences: {
          autoSync: true,
        },
      },
      include: {
        preferences: true,
      },
    });

    const notifications = partners
      .filter((partner) => {
        const prefs = partner.preferences;
        if (!prefs) return false;

        // Check if item matches partner preferences
        if (prefs.targetCategories.length > 0 && item.categoryId) {
          if (!prefs.targetCategories.includes(item.categoryId)) {
            return false;
          }
        }

        if (prefs.minPrice && item.price < prefs.minPrice) return false;
        if (prefs.maxPrice && item.price > prefs.maxPrice) return false;

        return true;
      })
      .map((partner) =>
        this.sendWebhook(partner.webhookUrl!, {
          type: 'NEW_ITEM',
          itemId: item.id,
          title: item.title,
          price: item.price,
          category: item.category?.name,
          imageUrl: item.images[0]?.url,
          itemUrl: `${process.env.FRONTEND_URL || 'https://collector.shop'}/items/${item.id}`,
        }),
      );

    await Promise.allSettled(notifications);
  }

  /**
   * Send webhook to partner
   */
  private async sendWebhook(url: string, data: any) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        this.logger.warn(`Webhook failed: ${url} - ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error(`Webhook error: ${url}`, error);
    }
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
