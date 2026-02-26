import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, items, transactions, categories] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.item.count(),
      this.prisma.transaction.count(),
      this.prisma.category.count(),
    ]);

    const totalRevenue = await this.prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { commission: true },
    });

    return {
      users,
      items,
      transactions,
      categories,
      totalCommission: totalRevenue._sum.commission || 0,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            sales: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException(
        'Impossible de supprimer un administrateur',
      );
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // Categories Management
  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string) {
    const existing = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      throw new BadRequestException('Cette catégorie existe déjà');
    }

    return this.prisma.category.create({
      data: { name },
    });
  }

  async deleteCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { items: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    if (category._count.items > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cette catégorie : ${category._count.items} objet(s) associé(s)`,
      );
    }

    return this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  // Items Management
  async getItems() {
    return this.prisma.item.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        published: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async deleteItem(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        transaction: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Objet introuvable');
    }

    if (item.transaction && item.transaction.status === 'COMPLETED') {
      throw new BadRequestException(
        'Impossible de supprimer un objet déjà vendu',
      );
    }

    return this.prisma.item.delete({
      where: { id: itemId },
    });
  }

  async getFlaggedItems() {
    // Pour l'instant, retourne les items sans images ou avec des descriptions suspectes
    // Dans le futur, on pourrait ajouter un système de signalement
    return this.prisma.item.findMany({
      where: {
        OR: [{ images: { none: {} } }, { description: { contains: 'test' } }],
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        images: true,
      },
      take: 50,
    });
  }

  // Transactions
  async getTransactions() {
    return this.prisma.transaction.findMany({
      select: {
        id: true,
        amount: true,
        commission: true,
        status: true,
        createdAt: true,
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
        item: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // Chat Moderation
  async getAllMessages() {
    return this.prisma.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conversation: {
          include: {
            participants: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async getAllConversations() {
    return this.prisma.conversation.findMany({
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async deleteMessage(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async deleteConversation(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    return this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }
}
