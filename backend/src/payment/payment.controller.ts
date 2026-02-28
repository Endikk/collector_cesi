import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Créer un Payment Intent (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  async createPaymentIntent(
    @Body() body: CreatePaymentIntentDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    // Use authenticated user's ID instead of client-supplied buyerId to prevent spoofing
    const buyerId = req.user?.id || body.buyerId;
    return this.paymentService.createPaymentIntent(body.itemId, buyerId);
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
