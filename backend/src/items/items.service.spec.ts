import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ModerationService } from '../moderation/moderation.service';
import { AdvertisingService } from '../advertising/advertising.service';
import { FraudDetectionService } from '../fraud-detection/fraud-detection.service';
import { NotificationsService } from '../notifications/notifications.service';

const mockPrismaService = {
    item: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    category: {
        findMany: jest.fn(),
    },
};

const mockModerationService = {
    checkContent: jest.fn().mockResolvedValue({ isSafe: true }),
};

const mockAdvertisingService = {
    checkPromotedStatus: jest.fn(),
};

const mockFraudDetectionService = {
    analyzePriceChange: jest.fn(),
    sendToBackOffice: jest.fn(),
    requiresManualReview: jest.fn(),
    getSellerStats: jest.fn(),
};

const mockNotificationsService = {
    createNotification: jest.fn(),
};

describe('ItemsService', () => {
    let service: ItemsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ModerationService, useValue: mockModerationService },
                { provide: AdvertisingService, useValue: mockAdvertisingService },
                { provide: FraudDetectionService, useValue: mockFraudDetectionService },
                { provide: NotificationsService, useValue: mockNotificationsService },
            ],
        }).compile();

        service = module.get<ItemsService>(ItemsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCategories', () => {
        it('should return an array of categories', async () => {
            const result = [];
            mockPrismaService.category.findMany.mockResolvedValue(result);

            expect(await service.getCategories()).toEqual(result);
        });
    });

    describe('getItemById', () => {
        it('should return a single item', async () => {
            const mockItem = { id: '1', title: 'Test Item' };
            mockPrismaService.item.findUnique.mockResolvedValue(mockItem);

            expect(await service.getItemById('1')).toEqual(mockItem);
        });

        it('should throw NotFoundException if item not found', async () => {
            mockPrismaService.item.findUnique.mockResolvedValue(null);
            await expect(service.getItemById('999')).rejects.toThrow(NotFoundException);
        });
    });
});
