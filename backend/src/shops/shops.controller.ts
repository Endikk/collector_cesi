import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  /**
   * Créer une boutique (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createShop(
    @Request() req: { user: { id: string } },
    @Body() data: CreateShopDto,
  ) {
    return this.shopsService.createShop(req.user.id, data);
  }

  /**
   * Obtenir toutes les boutiques d'un vendeur
   */
  @Get('user/:userId')
  async getShopsByOwner(@Param('userId') userId: string) {
    return this.shopsService.getShopsByOwner(userId);
  }

  /**
   * Obtenir les boutiques du vendeur connecté (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-shops')
  async getMyShops(@Request() req: { user: { id: string } }) {
    return this.shopsService.getShopsByOwner(req.user.id);
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
   * Mettre à jour une boutique (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateShop(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() data: UpdateShopDto,
  ) {
    return this.shopsService.updateShop(id, req.user.id, data);
  }

  /**
   * Supprimer une boutique (authentifié uniquement)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteShop(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.shopsService.deleteShop(id, req.user.id);
  }
}
