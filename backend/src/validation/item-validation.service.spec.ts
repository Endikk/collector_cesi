import { ItemValidationService } from './item-validation.service';

describe('ItemValidationService', () => {
  let service: ItemValidationService;

  beforeEach(() => {
    service = new ItemValidationService();
  });

  const validItem = {
    title: 'Figurine Dragon Ball Z Vegeta',
    description:
      'Superbe figurine Dragon Ball Z représentant Vegeta en mode Super Saiyan. État neuf, dans sa boîte originale.',
    price: 45,
    images: [
      { url: 'https://img.com/fig1.jpg' },
      { url: 'https://img.com/fig2.png' },
    ],
    categoryId: 'cat1',
  };

  describe('validateItem', () => {
    it('should approve a valid item', () => {
      const result = service.validateItem(validItem);
      expect(result.isValid).toBe(true);
      expect(result.status).toBe('APPROVED');
      expect(result.issues).toHaveLength(0);
    });

    it('should reject item with short title', () => {
      const result = service.validateItem({ ...validItem, title: 'Short' });
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('REJECTED');
      expect(
        result.issues.some((i: string) => i.includes('Titre trop court')),
      ).toBe(true);
    });

    it('should reject item with short description', () => {
      const result = service.validateItem({
        ...validItem,
        description: 'Trop court',
      });
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((i: string) =>
          i.includes('Description trop courte'),
        ),
      ).toBe(true);
    });

    it('should reject item with insufficient images', () => {
      const result = service.validateItem({
        ...validItem,
        images: [{ url: 'https://img.com/one.jpg' }],
      });
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((i: string) => i.includes('photos insuffisant')),
      ).toBe(true);
    });

    it('should reject item with no images', () => {
      const result = service.validateItem({ ...validItem, images: [] });
      expect(result.isValid).toBe(false);
    });

    it('should reject item with price below minimum', () => {
      const result = service.validateItem({ ...validItem, price: 0.1 });
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((i: string) => i.includes('Prix minimum')),
      ).toBe(true);
    });

    it('should reject item with price above maximum', () => {
      const result = service.validateItem({ ...validItem, price: 200000 });
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((i: string) => i.includes('Prix maximum')),
      ).toBe(true);
    });

    it('should reject item without category', () => {
      const result = service.validateItem({
        ...validItem,
        categoryId: undefined,
      });
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Catégorie obligatoire');
    });

    it('should flag suspicious content in title', () => {
      const result = service.validateItem({
        ...validItem,
        title: 'Contrefaçon de montre de luxe rare',
      });
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((i: string) => i.includes('contenu suspect')),
      ).toBe(true);
    });

    it('should flag suspicious content in description', () => {
      const result = service.validateItem({
        ...validItem,
        description:
          'Belle figurine, contactez-moi à test@email.com pour négocier le prix en dehors de la plateforme',
      });
      expect(
        result.issues.some((i: string) => i.includes('contenu suspect')),
      ).toBe(true);
    });

    it('should flag invalid image URLs', () => {
      const result = service.validateItem({
        ...validItem,
        images: [
          { url: 'https://img.com/fig1.jpg' },
          { url: 'not-a-valid-url' },
        ],
      });
      expect(
        result.issues.some((i: string) =>
          i.includes("URLs d'images sont invalides"),
        ),
      ).toBe(true);
    });

    it('should flag unrealistic price (round thousands)', () => {
      const result = service.validateItem({ ...validItem, price: 50000 });
      expect(
        result.issues.some((i: string) => i.includes('Prix semble inhabituel')),
      ).toBe(true);
    });

    it('should flag negative shipping cost', () => {
      const result = service.validateItem({ ...validItem, shippingCost: -5 });
      expect(
        result.issues.some((i: string) => i.includes('ne peuvent pas')),
      ).toBe(true);
    });

    it('should flag high shipping cost', () => {
      const result = service.validateItem({ ...validItem, shippingCost: 150 });
      expect(
        result.issues.some((i: string) => i.includes('inhabituellement')),
      ).toBe(true);
    });

    it('should return PENDING_REVIEW for non-blocking issues only', () => {
      const result = service.validateItem({ ...validItem, shippingCost: 150 });
      expect(result.status).toBe('PENDING_REVIEW');
    });
  });

  describe('revalidateItem', () => {
    it('should behave the same as validateItem', () => {
      const result1 = service.validateItem(validItem);
      const result2 = service.revalidateItem('item-id', validItem);
      expect(result1).toEqual(result2);
    });
  });

  describe('getValidationRules', () => {
    it('should return validation rules', () => {
      const rules = service.getValidationRules();
      expect(rules.title.minLength).toBe(10);
      expect(rules.description.minLength).toBe(50);
      expect(rules.images.minCount).toBe(2);
      expect(rules.price.min).toBe(0.5);
      expect(rules.price.max).toBe(100000);
      expect(rules.categoryId.required).toBe(true);
    });
  });
});
