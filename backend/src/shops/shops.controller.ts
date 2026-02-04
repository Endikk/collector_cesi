import { Controller, Get, Param } from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Get(':id')
    getShop(@Param('id') id: string) {
        return this.shopsService.getShop(id);
    }
}
