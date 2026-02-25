import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FraudDetectionService,
  PriceChangeEvent,
} from '../fraud-detection/fraud-detection.service';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private prisma: PrismaService,
    private fraudDetection: FraudDetectionService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Obtenir toutes les catégories (endpoint public)
   */
  async getCategories() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtenir un article par ID
   */
  async getItemById(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isSeller: true,
            sellerType: true,
          },
        },
        images: true,
        category: true,
        shop: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Article non trouvé');
    }

    return item;
  }

  /**
   * Mettre à jour le prix d'un article avec détection de fraudes
   */
  async updateItemPrice(
    itemId: string,
    ownerId: string,
    newPrice: number,
  ): Promise<{
    item: any;
    priceChange: {
      old: number;
      new: number;
      change: number;
      changePercent: number;
    };
    fraudAlerts: any[];
    requiresReview: boolean;
  }> {
    // Vérifier que l'article existe et appartient à l'utilisateur
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            sellerType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Article non trouvé');
    }

    if (item.ownerId !== ownerId) {
      throw new BadRequestException(
        "Vous n'êtes pas le propriétaire de cet article",
      );
    }

    const oldPrice = item.price;

    // Si le prix n'a pas changé, ne rien faire
    if (oldPrice === newPrice) {
      return {
        item,
        priceChange: {
          old: oldPrice,
          new: newPrice,
          change: 0,
          changePercent: 0,
        },
        fraudAlerts: [],
        requiresReview: false,
      };
    }

    this.logger.log(
      `Price change for item ${itemId}: ${oldPrice}€ → ${newPrice}€`,
    );

    // Calculer le pourcentage de changement
    const priceChange = newPrice - oldPrice;
    const priceChangePercent = (priceChange / oldPrice) * 100;

    // Obtenir les stats du vendeur
    const sellerStats = await this.fraudDetection.getSellerStats(ownerId);

    // Créer l'événement de changement de prix
    const priceChangeEvent: PriceChangeEvent = {
      itemId: item.id,
      itemTitle: item.title,
      oldPrice,
      newPrice,
      priceChange,
      priceChangePercent,
      sellerId: item.ownerId,
      sellerEmail: item.owner.email,
      sellerType: item.owner.sellerType,
      timestamp: new Date(),
      sellerStats: sellerStats || undefined,
    };

    // Analyser la fraude
    const fraudAlerts =
      await this.fraudDetection.analyzePriceChange(priceChangeEvent);

    // Envoyer au back-office de détection de fraudes
    await this.fraudDetection.sendToBackOffice(priceChangeEvent, fraudAlerts);

    // Mettre à jour l'article et enregistrer l'historique dans une transaction
    const updatedItem = await this.prisma.$transaction(async (tx) => {
      // Enregistrer l'ancien prix dans l'historique
      await tx.priceHistory.create({
        data: {
          itemId: item.id,
          price: oldPrice,
          recordedAt: new Date(),
        },
      });

      // Mettre à jour le prix
      const updated = await tx.item.update({
        where: { id: itemId },
        data: { price: newPrice },
        include: {
          owner: true,
          images: true,
          category: true,
        },
      });

      return updated;
    });

    // Notifier les utilisateurs intéressés (en arrière-plan)
    this.notifyInterestedUsers(
      item.id,
      oldPrice,
      newPrice,
      priceChangePercent,
    ).catch((error) => {
      this.logger.error('Failed to notify interested users', error);
    });

    return {
      item: updatedItem,
      priceChange: {
        old: oldPrice,
        new: newPrice,
        change: priceChange,
        changePercent: priceChangePercent,
      },
      fraudAlerts,
      requiresReview: this.fraudDetection.requiresManualReview(fraudAlerts),
    };
  }

  /**
   * Notifier les utilisateurs ayant manifesté de l'intérêt pour cet article
   */
  private async notifyInterestedUsers(
    itemId: string,
    oldPrice: number,
    newPrice: number,
    changePercent: number,
  ): Promise<void> {
    // Récupérer l'article avec détails
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: true,
      },
    });

    if (!item) return;

    // Trouver les utilisateurs intéressés par cette catégorie et gamme de prix
    const interestedUsers = await this.prisma.userInterest.findMany({
      where: {
        AND: [
          {
            OR: [
              { categoryId: item.categoryId },
              { categoryId: null }, // Intéressés par tous les articles
            ],
          },
          {
            OR: [
              {
                AND: [
                  { minPrice: { lte: newPrice } },
                  { maxPrice: { gte: newPrice } },
                ],
              },
              { minPrice: null, maxPrice: null }, // Pas de filtre de prix
            ],
          },
        ],
        userId: {
          not: item.ownerId, // Ne pas notifier le vendeur
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            notificationPreferences: true,
          },
        },
      },
    });

    this.logger.log(
      `Found ${interestedUsers.length} interested users for price change on item ${itemId}`,
    );

    // Créer les notifications
    const notificationPromises = interestedUsers.map(async (interest) => {
      const user = interest.user;

      // Vérifier les préférences de notification
      if (
        !user.notificationPreferences?.emailMatchingInterest &&
        !user.notificationPreferences?.inAppMatchingInterest
      ) {
        return;
      }

      const priceDirection = newPrice < oldPrice ? 'baissé' : 'augmenté';
      const priceEmoji = newPrice < oldPrice ? '📉' : '📈';

      // Créer notification in-app
      if (user.notificationPreferences?.inAppMatchingInterest) {
        await this.notifications.createNotification({
          userId: user.id,
          type: NotificationType.PRICE_DROP,
          data: `${priceEmoji} Le prix de "${item.title}" a ${priceDirection} de ${Math.abs(changePercent).toFixed(0)}%`,
        });
      }

      // TODO: Envoyer email si préférence activée
      if (user.notificationPreferences?.emailMatchingInterest) {
        this.logger.log(
          `Email notification for price change to user ${user.email}`,
        );
        // Intégration avec le service d'email existant
      }
    });

    await Promise.all(notificationPromises);

    this.logger.log(
      `Sent ${interestedUsers.length} notifications for price change on item ${itemId}`,
    );
  }

  /**
   * Mettre à jour un article (titre, description, etc.)
   */
  async updateItem(
    itemId: string,
    ownerId: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      shippingCost?: number;
      categoryId?: string;
      shopId?: string;
    },
  ) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Article non trouvé');
    }

    if (item.ownerId !== ownerId) {
      throw new BadRequestException(
        "Vous n'êtes pas le propriétaire de cet article",
      );
    }

    // Si le prix change, utiliser updateItemPrice
    if (data.price !== undefined && data.price !== item.price) {
      return this.updateItemPrice(itemId, ownerId, data.price);
    }

    // Sinon, mise à jour normale
    return this.prisma.item.update({
      where: { id: itemId },
      data,
      include: {
        owner: true,
        images: true,
        category: true,
        shop: true,
      },
    });
  }

  /**
   * Obtenir l'historique des prix d'un article
   */
  async getPriceHistory(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, price: true },
    });

    if (!item) {
      throw new NotFoundException('Article non trouvé');
    }

    const history = await this.prisma.priceHistory.findMany({
      where: { itemId },
      orderBy: { recordedAt: 'desc' },
    });

    return {
      currentPrice: item.price,
      history,
    };
  }
}
