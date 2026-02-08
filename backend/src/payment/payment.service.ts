import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly COMMISSION_RATE = 0.05; // 5% commission

  constructor(private prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
    });
  }

  /**
   * Créer un Payment Intent pour un article
   */
  async createPaymentIntent(itemId: string, buyerId: string) {
    // Vérifier que l'article existe et est disponible
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        owner: true,
        transaction: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Article non trouvé');
    }

    if (!item.published) {
      throw new BadRequestException('Article non publié');
    }

    if (item.status !== 'AVAILABLE') {
      throw new BadRequestException('Article non disponible');
    }

    if (item.transaction) {
      throw new BadRequestException('Article déjà vendu');
    }

    if (item.ownerId === buyerId) {
      throw new BadRequestException(
        'Vous ne pouvez pas acheter votre propre article',
      );
    }

    // Calculer la commission
    const commission = item.price * this.COMMISSION_RATE;
    const totalAmount = item.price;

    // Créer le Payment Intent Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        itemId: item.id,
        buyerId,
        sellerId: item.ownerId,
        commission: commission.toString(),
      },
      description: `Achat de: ${item.title}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Créer la transaction en statut PENDING
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: totalAmount,
        commission,
        status: 'PENDING',
        buyerId,
        sellerId: item.ownerId,
        itemId: item.id,
        stripePaymentIntentId: paymentIntent.id,
        stripePaymentStatus: paymentIntent.status,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction.id,
      amount: totalAmount,
      commission,
    };
  }

  /**
   * Webhook handler pour les événements Stripe
   */
  async handleWebhook(signature: string, body: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const error = err as Error;
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }

    // Traiter l'événement
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Traiter un paiement réussi
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { item: true },
    });

    if (!transaction) {
      console.error(
        `Transaction not found for PaymentIntent: ${paymentIntent.id}`,
      );
      return;
    }

    // Mettre à jour la transaction et l'article
    await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          stripePaymentStatus: paymentIntent.status,
        },
      }),
      this.prisma.item.update({
        where: { id: transaction.itemId },
        data: {
          status: 'SOLD',
        },
      }),
    ]);

    console.log(`Payment succeeded for transaction ${transaction.id}`);

    // TODO: Envoyer une notification à l'acheteur et au vendeur
  }

  /**
   * Traiter un paiement échoué
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!transaction) {
      return;
    }

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'CANCELLED',
        stripePaymentStatus: paymentIntent.status,
      },
    });

    console.log(`Payment failed for transaction ${transaction.id}`);
  }

  /**
   * Traiter un paiement annulé
   */
  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!transaction) {
      return;
    }

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'CANCELLED',
        stripePaymentStatus: paymentIntent.status,
      },
    });

    console.log(`Payment canceled for transaction ${transaction.id}`);
  }

  /**
   * Récupérer le statut d'un paiement
   */
  async getPaymentStatus(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    if (!transaction.stripePaymentIntentId) {
      return {
        status: transaction.status,
        stripeStatus: null,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      transaction.stripePaymentIntentId,
    );

    return {
      status: transaction.status,
      stripeStatus: paymentIntent.status,
      amount: transaction.amount,
    };
  }
}
