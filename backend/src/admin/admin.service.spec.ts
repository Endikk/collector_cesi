import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      item: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      conversation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      transaction: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getStats', () => {
    it('should return platform statistics', async () => {
      prisma.user.count.mockResolvedValue(42);
      prisma.item.count.mockResolvedValue(100);
      prisma.transaction.count.mockResolvedValue(15);
      prisma.category.count.mockResolvedValue(8);
      prisma.transaction.aggregate.mockResolvedValue({
        _sum: { commission: 250 },
      });

      const result = await service.getStats();
      expect(result).toHaveProperty('users', 42);
      expect(result).toHaveProperty('items', 100);
      expect(result).toHaveProperty('transactions', 15);
      expect(result).toHaveProperty('categories', 8);
      expect(result).toHaveProperty('totalCommission', 250);
    });
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ id: '1', name: 'Alice', email: 'a@b.com' }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.getUsers();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
      prisma.user.delete.mockResolvedValue({ id: 'u1' });

      const result = await service.deleteUser('u1');
      expect(result).toEqual({ id: 'u1' });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser('bad')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for admin user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN' });

      await expect(service.deleteUser('u1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCategories', () => {
    it('should return categories with item count', async () => {
      const cats = [{ id: 'c1', name: 'Consoles', _count: { items: 5 } }];
      prisma.category.findMany.mockResolvedValue(cats);

      const result = await service.getCategories();
      expect(result).toEqual(cats);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue({ id: 'c1', name: 'Figurines' });

      const result = await service.createCategory('Figurines');
      expect(result.name).toBe('Figurines');
    });

    it('should throw if category already exists', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Figurines',
      });

      await expect(service.createCategory('Figurines')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category with no items', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Empty',
        _count: { items: 0 },
      });
      prisma.category.delete.mockResolvedValue({ id: 'c1' });

      const result = await service.deleteCategory('c1');
      expect(result).toEqual({ id: 'c1' });
    });

    it('should throw NotFoundException if category not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.deleteCategory('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if category has items', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Busy',
        _count: { items: 3 },
      });

      await expect(service.deleteCategory('c1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getItems', () => {
    it('should return list of items', async () => {
      const items = [{ id: 'i1', title: 'Item 1' }];
      prisma.item.findMany.mockResolvedValue(items);

      const result = await service.getItems();
      expect(result).toEqual(items);
    });
  });

  describe('deleteItem', () => {
    it('should delete an item without completed transaction', async () => {
      prisma.item.findUnique.mockResolvedValue({ id: 'i1', transaction: null });
      prisma.item.delete.mockResolvedValue({ id: 'i1' });

      const result = await service.deleteItem('i1');
      expect(result).toEqual({ id: 'i1' });
    });

    it('should throw NotFoundException if item not found', async () => {
      prisma.item.findUnique.mockResolvedValue(null);

      await expect(service.deleteItem('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if item has completed transaction', async () => {
      prisma.item.findUnique.mockResolvedValue({
        id: 'i1',
        transaction: { status: 'COMPLETED' },
      });

      await expect(service.deleteItem('i1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getFlaggedItems', () => {
    it('should return flagged items', async () => {
      prisma.item.findMany.mockResolvedValue([
        { id: 'i1', title: 'test item' },
      ]);

      const result = await service.getFlaggedItems();
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllMessages', () => {
    it('should return messages with senders', async () => {
      prisma.message.findMany.mockResolvedValue([
        { id: 'm1', content: 'Hello' },
      ]);

      const result = await service.getAllMessages();
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllConversations', () => {
    it('should return conversations', async () => {
      prisma.conversation.findMany.mockResolvedValue([{ id: 'conv1' }]);

      const result = await service.getAllConversations();
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      prisma.message.findUnique.mockResolvedValue({ id: 'm1' });
      prisma.message.delete.mockResolvedValue({ id: 'm1' });

      const result = await service.deleteMessage('m1');
      expect(result).toEqual({ id: 'm1' });
    });

    it('should throw NotFoundException if message not found', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(service.deleteMessage('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue({ id: 'conv1' });
      prisma.conversation.delete.mockResolvedValue({ id: 'conv1' });

      const result = await service.deleteConversation('conv1');
      expect(result).toEqual({ id: 'conv1' });
    });

    it('should throw NotFoundException if conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.deleteConversation('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
