import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const data = { userId: '1', type: 'TEST', data: 'data' };
      mockPrismaService.notification.create.mockResolvedValue(data);

      expect(await service.createNotification(data)).toEqual(data);
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);
      expect(await service.getUserNotifications('1')).toEqual([]);
    });
  });
});
