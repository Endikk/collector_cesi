import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(data: {
    rating: number;
    comment?: string;
    authorId: string;
    transactionId: string;
  }) {
    // Vérifier que la transaction existe
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: data.transactionId },
      include: { review: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    // Vérifier que l'utilisateur fait partie de la transaction
    if (
      transaction.buyerId !== data.authorId &&
      transaction.sellerId !== data.authorId
    ) {
      throw new BadRequestException(
        'Vous ne pouvez pas noter cette transaction',
      );
    }

    // Vérifier qu'il n'y a pas déjà une review
    if (transaction.review) {
      throw new BadRequestException('Cette transaction a déjà été notée');
    }

    // Déterminer qui est noté (l'autre partie de la transaction)
    const targetId =
      transaction.buyerId === data.authorId
        ? transaction.sellerId
        : transaction.buyerId;

    // Créer la review
    const review = await this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        authorId: data.authorId,
        targetId: targetId,
        transactionId: data.transactionId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        target: {
          select: { id: true, name: true },
        },
      },
    });

    return review;
  }

  async getReviewsForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { targetId: userId },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async canReviewTransaction(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { review: true },
    });

    if (!transaction) {
      return { canReview: false, reason: 'Transaction non trouvée' };
    }

    if (transaction.review) {
      return { canReview: false, reason: 'Transaction déjà notée' };
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return {
        canReview: false,
        reason: 'Vous ne faites pas partie de cette transaction',
      };
    }

    if (transaction.status !== 'COMPLETED') {
      return { canReview: false, reason: 'La transaction doit être terminée' };
    }

    return { canReview: true };
  }
}
