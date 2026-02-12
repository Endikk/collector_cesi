import { Test, TestingModule } from '@nestjs/testing';
import { ShopsService } from './shops.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    shop: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
};

describe('ShopsService', () => {
    let service: ShopsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ShopsService>(ShopsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createShop', () => {
        it('should create a shop if user exists', async () => {
            const mockUser = { id: 'user1' };
            const mockShop = { id: 'shop1', name: 'My Shop', ownerId: 'user1' };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.shop.create.mockResolvedValue(mockShop);

            const result = await service.createShop('user1', { name: 'My Shop' });
            expect(result).toEqual(mockShop);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.createShop('user1', { name: 'My Shop' })).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getShopById', () => {
        it('should return a shop with owner details', async () => {
            const mockShop = {
                id: 'shop1',
                owner: {
                    name: 'John',
                    bio: 'Bio',
                    reviewsReceived: [],
                    _count: { sales: 10, reviewsReceived: 5 },
                },
                _count: { items: 20 },
            };
            mockPrismaService.shop.findUnique.mockResolvedValue(mockShop);

            const result = await service.getShopById('shop1');
            expect(result.name).toEqual('John'); // Logic flattens owner name to shop level
            expect(result.bio).toEqual('Bio');
        });
    });
});
