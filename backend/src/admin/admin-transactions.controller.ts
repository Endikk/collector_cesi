import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminTransactionsController {
    constructor(private readonly adminService: AdminService) { }

    @Get('transactions')
    getTransactions() {
        return this.adminService.getTransactions();
    }
}
