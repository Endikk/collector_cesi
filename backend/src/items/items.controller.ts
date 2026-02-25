import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Liste des catégories',
    description: "Retourne toutes les catégories d'articles disponibles.",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Figurines' },
          description: { type: 'string' },
          itemCount: { type: 'number' },
        },
      },
    },
  })
  async getCategories() {
    return this.itemsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détails d'un article",
    description: "Retourne les informations détaillées d'un article.",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({
    status: 200,
    description: "Détails de l'article",
    schema: {
      properties: {
        id: { type: 'string' },
        title: { type: 'string', example: 'Figurine Star Wars vintage' },
        description: { type: 'string' },
        price: { type: 'number', example: 150.0 },
        currency: { type: 'string', example: 'EUR' },
        status: {
          type: 'string',
          enum: ['PENDING', 'APPROVED', 'REJECTED', 'SOLD'],
        },
        images: { type: 'array', items: { type: 'string' } },
        category: { type: 'object' },
        shop: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Article non trouvé' })
  async getItem(@Param('id') id: string) {
    return this.itemsService.getItemById(id);
  }

  @Get(':id/price-history')
  @ApiOperation({
    summary: 'Historique des prix',
    description: "Retourne l'historique des changements de prix d'un article.",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({
    status: 200,
    description: 'Historique des prix',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          oldPrice: { type: 'number' },
          newPrice: { type: 'number' },
          changedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getPriceHistory(@Param('id') id: string) {
    return this.itemsService.getPriceHistory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/price')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier le prix',
    description:
      "Met à jour le prix d'un article. Seul le propriétaire peut modifier.",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({ status: 200, description: 'Prix mis à jour' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: "Non propriétaire de l'article" })
  @ApiResponse({ status: 404, description: 'Article non trouvé' })
  async updatePrice(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdatePriceDto,
  ) {
    return this.itemsService.updateItemPrice(id, req.user.id, body.price);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier un article',
    description:
      "Met à jour les informations d'un article. Seul le propriétaire peut modifier.",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({ status: 200, description: 'Article mis à jour' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: "Non propriétaire de l'article" })
  @ApiResponse({ status: 404, description: 'Article non trouvé' })
  async updateItem(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, req.user.id, body);
  }
}
