import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Obtenir toutes les catégories (endpoint public)
   */
  @Get('categories')
  async getCategories() {
    return this.itemsService.getCategories();
  }

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
   * Mettre à jour le prix d'un article (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/price')
  async updatePrice(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdatePriceDto,
  ) {
    return this.itemsService.updateItemPrice(id, req.user.id, body.price);
  }

  /**
   * Mettre à jour un article (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateItem(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, req.user.id, body);
  }
}
