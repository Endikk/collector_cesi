import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  /**
   * Créer une boutique
   */
  @Post()
  async createShop(
    @Request() req: { user?: { id: string } },
    @Body()
    data: {
      name: string;
      description?: string;
      logo?: string;
    },
  ) {
    const userId = req.user?.id as string; // From JWT
    return this.shopsService.createShop(userId, data);
  }

  /**
   * Obtenir toutes les boutiques d'un vendeur
   */
  @Get('user/:userId')
  async getShopsByOwner(@Param('userId') userId: string) {
    return this.shopsService.getShopsByOwner(userId);
  }

  /**
   * Obtenir les boutiques du vendeur connecté
   */
  @Get('my-shops')
  async getMyShops(@Request() req: { user?: { id: string } }) {
    const userId = req.user?.id as string;
    return this.shopsService.getShopsByOwner(userId);
  }

  /**
   * Obtenir le profil de vendeur (legacy - vue boutique)
   */
  @Get('seller/:sellerId')
  async getShop(@Param('sellerId') sellerId: string) {
    return this.shopsService.getShop(sellerId);
  }

  /**
   * Obtenir une boutique par ID
   */
  @Get(':id')
  async getShopById(@Param('id') id: string) {
    return this.shopsService.getShopById(id);
  }

  /**
   * Mettre à jour une boutique
   */
  @Put(':id')
  async updateShop(
    @Param('id') id: string,
    @Request() req: { user?: { id: string } },
    @Body()
    data: {
      name?: string;
      description?: string;
      logo?: string;
    },
  ) {
    const userId = req.user?.id as string;
    return this.shopsService.updateShop(id, userId, data);
  }

  /**
   * Supprimer une boutique
   */
  @Delete(':id')
  async deleteShop(
    @Param('id') id: string,
    @Request() req: { user?: { id: string } },
  ) {
    const userId = req.user?.id as string;
    return this.shopsService.deleteShop(id, userId);
  }
}
