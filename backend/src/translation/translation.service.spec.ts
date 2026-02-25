import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      translation: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
  });

  describe('getTranslation', () => {
    it('should return translation value', async () => {
      prisma.translation.findUnique.mockResolvedValue({ value: 'Bonjour' });

      const result = await service.getTranslation('greeting', 'fr');
      expect(result).toBe('Bonjour');
    });

    it('should return null if not found', async () => {
      prisma.translation.findUnique.mockResolvedValue(null);

      const result = await service.getTranslation('missing', 'fr');
      expect(result).toBeNull();
    });
  });

  describe('getTranslations', () => {
    it('should return key-value map for locale', async () => {
      prisma.translation.findMany.mockResolvedValue([
        { key: 'greeting', value: 'Bonjour', context: null },
        { key: 'farewell', value: 'Au revoir', context: null },
      ]);

      const result = await service.getTranslations('fr');
      expect(result).toEqual({ greeting: 'Bonjour', farewell: 'Au revoir' });
    });

    it('should filter by context', async () => {
      prisma.translation.findMany.mockResolvedValue([
        { key: 'btn.save', value: 'Sauvegarder', context: 'ui' },
      ]);

      const result = await service.getTranslations('fr', 'ui');
      expect(result).toEqual({ 'btn.save': 'Sauvegarder' });
      expect(prisma.translation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { locale: 'fr', context: 'ui' },
        }),
      );
    });
  });

  describe('upsertTranslation', () => {
    it('should upsert a translation', async () => {
      const data = { key: 'greeting', locale: 'fr', value: 'Salut' };
      prisma.translation.upsert.mockResolvedValue(data);

      const result = await service.upsertTranslation(data);
      expect(result).toEqual(data);
    });
  });

  describe('bulkImportTranslations', () => {
    it('should import multiple translations in a transaction', async () => {
      prisma.$transaction.mockResolvedValue([]);

      const result = await service.bulkImportTranslations('fr', {
        greeting: 'Bonjour',
        farewell: 'Au revoir',
      });

      expect(result).toEqual({ count: 2 });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('deleteTranslation', () => {
    it('should delete a translation', async () => {
      prisma.translation.delete.mockResolvedValue({
        key: 'greeting',
        locale: 'fr',
      });

      const result = await service.deleteTranslation('greeting', 'fr');
      expect(result.key).toBe('greeting');
    });
  });

  describe('getAvailableLocales', () => {
    it('should return distinct locales', async () => {
      prisma.translation.findMany.mockResolvedValue([
        { locale: 'fr' },
        { locale: 'en' },
        { locale: 'de' },
      ]);

      const result = await service.getAvailableLocales();
      expect(result).toEqual(['fr', 'en', 'de']);
    });
  });

  describe('getTranslationCoverage', () => {
    it('should return coverage per locale', async () => {
      // getAvailableLocales call
      prisma.translation.findMany
        .mockResolvedValueOnce([{ locale: 'fr' }, { locale: 'en' }]) // getAvailableLocales
        .mockResolvedValueOnce([{ key: 'a' }, { key: 'b' }, { key: 'c' }]); // totalKeys

      prisma.translation.count
        .mockResolvedValueOnce(3) // fr count
        .mockResolvedValueOnce(2); // en count

      const result = await service.getTranslationCoverage();
      expect(result.fr.total).toBe(3);
      expect(result.fr.percentage).toBe(100);
      expect(result.en.total).toBe(2);
      expect(result.en.percentage).toBeCloseTo(66.67, 0);
    });
  });
});
