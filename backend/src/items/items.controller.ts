import { Controller, Get, Put, Param, Body, Request } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Obtenir un article par ID
   */
  @Get(':id')
  async getItem(@Param('id') id: string) {
    return this.itemsService.getItemById(id);
  }

  /**
   * Obtenir l'historique des prix d'un article
   */
  @Get(':id/price-history')
  async getPriceHistory(@Param('id') id: string) {
    return this.itemsService.getPriceHistory(id);
  }

  /**
   * Mettre à jour le prix d'un article
   */
  @Put(':id/price')
  async updatePrice(
    @Param('id') id: string,
    @Request() req: { user?: { id: string } },
    @Body() body: { price: number },
  ) {
    const userId = req.user?.id as string; // From JWT
    return this.itemsService.updateItemPrice(id, userId, body.price);
  }

  /**
   * Mettre à jour un article (titre, description, etc.)
   */
  @Put(':id')
  async updateItem(
    @Param('id') id: string,
    @Request() req: { user?: { id: string } },
    @Body()
    body: {
      title?: string;
      description?: string;
      price?: number;
      shippingCost?: number;
      categoryId?: string;
      shopId?: string;
    },
  ) {
    const userId = req.user?.id as string;
    return this.itemsService.updateItem(id, userId, body);
  }
}
