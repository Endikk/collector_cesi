import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle boutique
   */
  async createShop(
    ownerId: string,
    data: {
      name: string;
      description?: string;
      logo?: string;
    },
  ) {
    // Vérifier que l'utilisateur est un vendeur
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Créer la boutique
    return this.prisma.shop.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        ownerId,
      },
    });
  }

  /**
   * Obtenir toutes les boutiques d'un vendeur
   */
  async getShopsByOwner(ownerId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId },
      include: {
        items: {
          where: {
            published: true,
            validationStatus: 'APPROVED',
          },
          include: { images: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });
  }

  /**
   * Obtenir une boutique par ID
   */
  async getShopById(shopId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            isSeller: true,
            sellerType: true,
            createdAt: true,
            bio: true,
            reviewsReceived: {
              include: {
                author: {
                  select: {
                    name: true,
                  },
                },
              },
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: {
                sales: true,
                reviewsReceived: true,
              },
            },
          },
        },
        items: {
          where: {
            published: true,
            validationStatus: 'APPROVED',
          },
          include: {
            images: true,
            category: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Boutique non trouvée');
    }

    // Restructure to match frontend expectations (flatten owner data to shop level)
    return {
      ...shop,
      name: shop.owner.name,
      bio: shop.owner.bio,
      reviewsReceived: shop.owner.reviewsReceived,
      _count: {
        ...shop._count,
        reviewsReceived: shop.owner._count.reviewsReceived,
        sales: shop.owner._count.sales,
      },
    };
  }

  /**
   * Mettre à jour une boutique
   */
  async updateShop(
    shopId: string,
    ownerId: string,
    data: {
      name?: string;
      description?: string;
      logo?: string;
    },
  ) {
    // Vérifier que la boutique appartient bien au vendeur
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Boutique non trouvée');
    }

    if (shop.ownerId !== ownerId) {
      throw new BadRequestException(
        "Vous n'êtes pas le propriétaire de cette boutique",
      );
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data,
    });
  }

  /**
   * Supprimer une boutique
   */
  async deleteShop(shopId: string, ownerId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Boutique non trouvée');
    }

    if (shop.ownerId !== ownerId) {
      throw new BadRequestException(
        "Vous n'êtes pas le propriétaire de cette boutique",
      );
    }

    if (shop._count.items > 0) {
      throw new BadRequestException(
        "Impossible de supprimer une boutique contenant des articles. Supprimez ou déplacez les articles d'abord.",
      );
    }

    return this.prisma.shop.delete({
      where: { id: shopId },
    });
  }

  /**
   * Obtenir le profil de vendeur (vue boutique)
   */
  async getShop(sellerId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      include: {
        shops: {
          include: {
            items: {
              where: {
                published: true,
                validationStatus: 'APPROVED',
              },
              include: { images: true },
            },
          },
        },
        items: {
          where: {
            published: true,
            validationStatus: 'APPROVED',
            shopId: null, // Items sans boutique spécifique
          },
          include: { images: true },
        },
        reviewsReceived: {
          include: { author: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { sales: true, reviewsReceived: true },
        },
      },
    });

    if (!seller) throw new NotFoundException('Seller not found');

    return seller;
  }
}
