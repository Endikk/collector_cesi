import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Categories Management
  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() body: { name: string }) {
    return this.adminService.createCategory(body.name);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Items Management
  @Get('items')
  getItems() {
    return this.adminService.getItems();
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.adminService.deleteItem(id);
  }

  // Transactions
  @Get('transactions')
  getTransactions() {
    return this.adminService.getTransactions();
  }

  // Reports & Moderation
  @Get('items/flagged')
  getFlaggedItems() {
    return this.adminService.getFlaggedItems();
  }

  // Chat Moderation
  @Get('messages')
  getAllMessages() {
    return this.adminService.getAllMessages();
  }

  @Get('conversations')
  getAllConversations() {
    return this.adminService.getAllConversations();
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string) {
    return this.adminService.deleteMessage(id);
  }

  @Delete('conversations/:id')
  deleteConversation(@Param('id') id: string) {
    return this.adminService.deleteConversation(id);
  }
}
