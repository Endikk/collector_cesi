import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Créer un Payment Intent
   */
  @Post('create-intent')
  async createPaymentIntent(@Body() body: { itemId: string; buyerId: string }) {
    if (!body.itemId || !body.buyerId) {
      throw new BadRequestException('itemId et buyerId sont requis');
    }

    return this.paymentService.createPaymentIntent(body.itemId, body.buyerId);
  }

  /**
   * Webhook Stripe
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const body = request.rawBody;
    if (!body) {
      throw new BadRequestException('Missing request body');
    }

    return this.paymentService.handleWebhook(signature, body);
  }

  /**
   * Récupérer le statut d'un paiement
   */
  @Get('status/:transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    return this.paymentService.getPaymentStatus(transactionId);
  }
}
