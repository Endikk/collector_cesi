import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisingService } from './advertising.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdvertisingService', () => {
  let service: AdvertisingService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      item: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      advertisingPartner: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      partnerPreferences: {
        upsert: jest.fn(),
      },
      adImpression: {
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvertisingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AdvertisingService>(AdvertisingService);
  });

  describe('generateAdFeed', () => {
    it('should return ad feed items', async () => {
      prisma.item.findMany.mockResolvedValue([
        {
          id: 'i1',
          title: 'Figurine',
          description: 'A nice figurine',
          price: 25,
          status: 'AVAILABLE',
          images: [{ url: 'https://img.com/fig.jpg' }],
          category: { name: 'Figurines' },
          owner: { id: 'u1', name: 'Alice', email: 'a@b.com' },
        },
      ]);

      const result = await service.generateAdFeed();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Figurine');
      expect(result[0].currency).toBe('EUR');
    });

    it('should apply price filters', async () => {
      prisma.item.findMany.mockResolvedValue([]);

      const result = await service.generateAdFeed({
        minPrice: 10,
        maxPrice: 50,
      });
      expect(result).toEqual([]);
      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 10, lte: 50 },
          }),
        }),
      );
    });

    it('should filter by partner preferences', async () => {
      prisma.advertisingPartner.findUnique.mockResolvedValue({
        id: 'p1',
        preferences: {
          targetCategories: ['cat1'],
          minPrice: 5,
          maxPrice: 100,
        },
      });
      prisma.item.findMany.mockResolvedValue([]);

      const result = await service.generateAdFeed({ partnerId: 'p1' });
      expect(result).toEqual([]);
    });

    it('should filter by categories', async () => {
      prisma.item.findMany.mockResolvedValue([]);

      await service.generateAdFeed({ categories: ['cat1', 'cat2'] });
      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: { in: ['cat1', 'cat2'] },
          }),
        }),
      );
    });
  });

  describe('generateXMLFeed', () => {
    it('should generate valid XML', () => {
      const items = [
        {
          id: 'i1',
          title: 'Figurine',
          description: 'A nice figurine',
          price: 25,
          currency: 'EUR',
          imageUrl: 'https://img.com/fig.jpg',
          itemUrl: 'https://collector.shop/items/i1',
          category: 'Figurines',
          condition: 'AVAILABLE',
          availability: 'in_stock' as const,
          seller: { id: 'u1', name: 'Alice', rating: 4.5 },
        },
      ];

      const xml = service.generateXMLFeed(items);
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<title>Figurine</title>');
      expect(xml).toContain('<price>25 EUR</price>');
    });

    it('should escape XML special characters', () => {
      const items = [
        {
          id: 'i1',
          title: 'Item <special> & "chars"',
          description: "Test's description",
          price: 10,
          currency: 'EUR',
          imageUrl: 'https://img.com/fig.jpg',
          itemUrl: 'https://example.com',
          category: 'Cat',
          condition: 'used',
          availability: 'in_stock' as const,
          seller: { id: 'u1', name: 'Bob' },
        },
      ];

      const xml = service.generateXMLFeed(items);
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&lt;special&gt;');
    });
  });

  describe('trackImpression', () => {
    it('should create an impression record', async () => {
      const data = { partnerId: 'p1', itemId: 'i1' };
      prisma.adImpression.create.mockResolvedValue({ id: 'imp1', ...data });

      const result = await service.trackImpression(data);
      expect(result.id).toBe('imp1');
    });
  });

  describe('trackClick', () => {
    it('should update impression with clicked=true', async () => {
      prisma.adImpression.update.mockResolvedValue({
        id: 'imp1',
        clicked: true,
      });

      const result = await service.trackClick('imp1');
      expect(result.clicked).toBe(true);
    });
  });

  describe('getPartnerAnalytics', () => {
    it('should return analytics with CTR', async () => {
      prisma.adImpression.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(50);
      prisma.adImpression.groupBy.mockResolvedValue([
        { itemId: 'i1', _count: { id: 25 } },
      ]);

      const result = await service.getPartnerAnalytics('p1', 30);
      expect(result.impressions).toBe(1000);
      expect(result.clicks).toBe(50);
      expect(result.ctr).toBe(5);
    });

    it('should handle zero impressions', async () => {
      prisma.adImpression.count.mockResolvedValue(0);
      prisma.adImpression.groupBy.mockResolvedValue([]);

      const result = await service.getPartnerAnalytics('p1');
      expect(result.ctr).toBe(0);
    });
  });

  describe('createPartner', () => {
    it('should create a new partner', async () => {
      const data = { name: 'Partner', domain: 'example.com', apiKey: 'key123' };
      prisma.advertisingPartner.create.mockResolvedValue({ id: 'p1', ...data });

      const result = await service.createPartner(data);
      expect(result.name).toBe('Partner');
    });
  });

  describe('updatePartnerPreferences', () => {
    it('should upsert preferences', async () => {
      const prefs = { targetCategories: ['cat1'], minPrice: 10 };
      prisma.partnerPreferences.upsert.mockResolvedValue({
        partnerId: 'p1',
        ...prefs,
      });

      const result = await service.updatePartnerPreferences('p1', prefs);
      expect(result.partnerId).toBe('p1');
    });
  });

  describe('validateApiKey', () => {
    it('should return partner if active', async () => {
      prisma.advertisingPartner.findUnique.mockResolvedValue({
        id: 'p1',
        active: true,
        name: 'Partner',
      });

      const result = await service.validateApiKey('valid-key');
      expect(result?.id).toBe('p1');
    });

    it('should return null if partner inactive', async () => {
      prisma.advertisingPartner.findUnique.mockResolvedValue({
        id: 'p1',
        active: false,
      });

      const result = await service.validateApiKey('inactive-key');
      expect(result).toBeNull();
    });

    it('should return null if key not found', async () => {
      prisma.advertisingPartner.findUnique.mockResolvedValue(null);

      const result = await service.validateApiKey('unknown');
      expect(result).toBeNull();
    });
  });
});
