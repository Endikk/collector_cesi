import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminTransactionsController } from './admin-transactions.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, AdminTransactionsController],
  providers: [AdminService],
})
export class AdminModule {}
