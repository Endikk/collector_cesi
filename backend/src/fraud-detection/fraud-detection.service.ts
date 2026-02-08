import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PriceChangeEvent {
  itemId: string;
  itemTitle: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePercent: number;
  sellerId: string;
  sellerEmail: string;
  sellerType: string | null;
  timestamp: Date;
  sellerStats?: {
    totalItems: number;
    totalSales: number;
    averageItemPrice: number;
    accountAge: number; // en jours
  };
}

export interface FraudAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
  itemId: string;
  sellerId: string;
  timestamp: Date;
  details: any;
}

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  // Seuils de détection d'anomalies
  private readonly PRICE_INCREASE_WARNING_THRESHOLD = 50; // +50% = warning
  private readonly PRICE_INCREASE_CRITICAL_THRESHOLD = 200; // +200% = critique
  private readonly PRICE_DECREASE_WARNING_THRESHOLD = 30; // -30% = warning
  private readonly UNUSUAL_PRICE_THRESHOLD = 10000; // Prix > 10 000€
  private readonly FREQUENT_CHANGES_THRESHOLD = 5; // 5 changements en 24h
  private readonly FREQUENT_CHANGES_WINDOW = 24 * 60 * 60 * 1000; // 24h en ms

  constructor(private prisma: PrismaService) {}

  /**
   * Analyser un changement de prix et détecter les anomalies
   */
  async analyzePriceChange(event: PriceChangeEvent): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = [];

    this.logger.log(
      `Analyzing price change for item ${event.itemId}: ${event.oldPrice}€ → ${event.newPrice}€`,
    );

    // 1. Augmentation de prix suspecte
    if (event.priceChangePercent > this.PRICE_INCREASE_CRITICAL_THRESHOLD) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'EXTREME_PRICE_INCREASE',
        message: `Augmentation de prix extrême: +${event.priceChangePercent.toFixed(1)}%`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          oldPrice: event.oldPrice,
          newPrice: event.newPrice,
          increase: event.priceChangePercent,
        },
      });
    } else if (
      event.priceChangePercent > this.PRICE_INCREASE_WARNING_THRESHOLD
    ) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'HIGH_PRICE_INCREASE',
        message: `Augmentation de prix importante: +${event.priceChangePercent.toFixed(1)}%`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          oldPrice: event.oldPrice,
          newPrice: event.newPrice,
          increase: event.priceChangePercent,
        },
      });
    }

    // 2. Diminution de prix suspecte (possiblement pour attirer puis augmenter)
    if (event.priceChangePercent < -this.PRICE_DECREASE_WARNING_THRESHOLD) {
      alerts.push({
        severity: 'LOW',
        type: 'SIGNIFICANT_PRICE_DECREASE',
        message: `Diminution de prix importante: ${event.priceChangePercent.toFixed(1)}%`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          oldPrice: event.oldPrice,
          newPrice: event.newPrice,
          decrease: Math.abs(event.priceChangePercent),
        },
      });
    }

    // 3. Prix inhabituellement élevé
    if (event.newPrice > this.UNUSUAL_PRICE_THRESHOLD) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'UNUSUAL_HIGH_PRICE',
        message: `Prix inhabituellement élevé: ${event.newPrice}€`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          price: event.newPrice,
          threshold: this.UNUSUAL_PRICE_THRESHOLD,
        },
      });
    }

    // 4. Changements de prix fréquents
    const recentChanges = await this.getRecentPriceChanges(
      event.itemId,
      this.FREQUENT_CHANGES_WINDOW,
    );
    if (recentChanges.length >= this.FREQUENT_CHANGES_THRESHOLD) {
      alerts.push({
        severity: 'HIGH',
        type: 'FREQUENT_PRICE_CHANGES',
        message: `Changements de prix fréquents: ${recentChanges.length} en 24h`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          changesCount: recentChanges.length,
          timeWindow: '24h',
          changes: recentChanges,
        },
      });
    }

    // 5. Analyser le comportement du vendeur
    if (event.sellerStats) {
      const suspiciousSellerAlerts = this.analyzeSellerBehavior(
        event,
        event.sellerStats,
      );
      alerts.push(...suspiciousSellerAlerts);
    }

    // Enregistrer les alertes dans les logs
    if (alerts.length > 0) {
      this.logger.warn(
        `Detected ${alerts.length} fraud alerts for item ${event.itemId}`,
        { alerts },
      );
    }

    return alerts;
  }

  /**
   * Analyser le comportement du vendeur
   */
  private analyzeSellerBehavior(
    event: PriceChangeEvent,
    stats: NonNullable<PriceChangeEvent['sellerStats']>,
  ): FraudAlert[] {
    const alerts: FraudAlert[] = [];

    // Compte récent avec prix élevé
    if (stats.accountAge < 7 && event.newPrice > 1000) {
      alerts.push({
        severity: 'HIGH',
        type: 'NEW_ACCOUNT_HIGH_PRICE',
        message: `Compte récent (${stats.accountAge} jours) avec prix élevé`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          accountAge: stats.accountAge,
          price: event.newPrice,
        },
      });
    }

    // Prix bien au-dessus de la moyenne du vendeur
    if (
      stats.averageItemPrice > 0 &&
      event.newPrice > stats.averageItemPrice * 5
    ) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'PRICE_DEVIATION_FROM_AVERAGE',
        message: `Prix 5x supérieur à la moyenne du vendeur`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          itemPrice: event.newPrice,
          averagePrice: stats.averageItemPrice,
          ratio: event.newPrice / stats.averageItemPrice,
        },
      });
    }

    // Vendeur avec peu de ventes mais beaucoup d'articles
    if (stats.totalItems > 20 && stats.totalSales < 2) {
      alerts.push({
        severity: 'LOW',
        type: 'LOW_SELLER_CONVERSION',
        message: `Vendeur avec peu de ventes (${stats.totalSales}) malgré ${stats.totalItems} articles`,
        itemId: event.itemId,
        sellerId: event.sellerId,
        timestamp: event.timestamp,
        details: {
          totalItems: stats.totalItems,
          totalSales: stats.totalSales,
        },
      });
    }

    return alerts;
  }

  /**
   * Obtenir les changements de prix récents pour un article
   */
  private async getRecentPriceChanges(
    itemId: string,
    timeWindowMs: number,
  ): Promise<any[]> {
    const since = new Date(Date.now() - timeWindowMs);

    return this.prisma.priceHistory.findMany({
      where: {
        itemId,
        recordedAt: {
          gte: since,
        },
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }

  /**
   * Envoyer les alertes au système back-office externe
   * Cette méthode peut être configurée pour envoyer vers un webhook externe
   */
  async sendToBackOffice(
    event: PriceChangeEvent,
    alerts: FraudAlert[],
  ): Promise<void> {
    const backOfficeUrl = process.env.FRAUD_DETECTION_WEBHOOK_URL;

    // Si aucun webhook configuré, logger seulement
    if (!backOfficeUrl) {
      this.logger.log(
        'No fraud detection webhook configured. Logging alerts locally.',
      );
      this.logger.warn('Fraud Detection Alerts:', {
        event,
        alerts,
      });
      return;
    }

    // Envoyer au webhook externe
    try {
      const payload = {
        type: 'PRICE_CHANGE',
        timestamp: new Date().toISOString(),
        event,
        alerts,
        source: 'collector-marketplace',
      };

      this.logger.log(`Sending fraud alerts to back-office: ${backOfficeUrl}`);

      const response = await fetch(backOfficeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.FRAUD_DETECTION_API_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Back-office responded with status ${response.status}`);
      }

      this.logger.log(
        `Successfully sent ${alerts.length} alerts to back-office`,
      );
    } catch (error) {
      this.logger.error('Failed to send alerts to back-office', error);
      // Ne pas faire échouer l'opération si l'envoi échoue
      // Les alertes sont déjà loggées
    }
  }

  /**
   * Obtenir les statistiques d'un vendeur pour l'analyse
   */
  async getSellerStats(sellerId: string) {
    const [seller, items, sales] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: sellerId },
        select: { createdAt: true },
      }),
      this.prisma.item.findMany({
        where: { ownerId: sellerId },
        select: { price: true },
      }),
      this.prisma.transaction.count({
        where: { sellerId, status: 'COMPLETED' },
      }),
    ]);

    if (!seller) {
      return null;
    }

    const accountAge = Math.floor(
      (Date.now() - seller.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const averageItemPrice =
      items.length > 0
        ? items.reduce((sum, item) => sum + item.price, 0) / items.length
        : 0;

    return {
      totalItems: items.length,
      totalSales: sales,
      averageItemPrice,
      accountAge,
    };
  }

  /**
   * Vérifier si un article nécessite une révision manuelle
   */
  requiresManualReview(alerts: FraudAlert[]): boolean {
    if (alerts.length === 0) return false;

    // Si au moins une alerte CRITICAL ou plus de 2 alertes HIGH
    const criticalCount = alerts.filter(
      (a) => a.severity === 'CRITICAL',
    ).length;
    const highCount = alerts.filter((a) => a.severity === 'HIGH').length;

    return criticalCount > 0 || highCount >= 2;
  }
}
