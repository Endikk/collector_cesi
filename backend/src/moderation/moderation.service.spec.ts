import { ModerationService, ModerationResult } from './moderation.service';

describe('ModerationService', () => {
  let service: ModerationService;

  beforeEach(() => {
    service = new ModerationService();
  });

  // ============================================================
  // moderateContent()
  // ============================================================
  describe('moderateContent()', () => {
    it('should allow clean content without flagging', () => {
      const result: ModerationResult = service.moderateContent(
        'Bonjour, je suis intéressé par cette figurine Star Wars',
      );
      expect(result.flagged).toBe(false);
      expect(result.reasons).toHaveLength(0);
      expect(result.sanitizedContent).toBeUndefined();
    });

    it('should detect and mask email addresses', () => {
      const result = service.moderateContent(
        'Contactez-moi à john@gmail.com pour la vente',
      );
      expect(result.flagged).toBe(true);
      expect(result.reasons).toContain('Email détecté');
      expect(result.sanitizedContent).toContain('[EMAIL MASQUÉ]');
      expect(result.sanitizedContent).not.toContain('john@gmail.com');
    });

    it('should detect French phone numbers', () => {
      const result = service.moderateContent('Appelez-moi au 06 12 34 56 78');
      expect(result.flagged).toBe(true);
      expect(result.reasons).toContain('Numéro de téléphone détecté');
    });

    it('should detect external URLs but allow collector.shop links', () => {
      const externalResult = service.moderateContent(
        'Voir sur https://ebay.com/listing/123',
      );
      expect(externalResult.flagged).toBe(true);
      expect(externalResult.reasons).toContain('Lien externe détecté');

      const internalResult = service.moderateContent(
        'Voir sur https://collector.shop/items/123',
      );
      expect(internalResult.flagged).toBe(false);
    });

    it('should detect suspicious keywords (payment bypass attempt)', () => {
      const result = service.moderateContent(
        'On peut se retrouver et payer en cash directement',
      );
      expect(result.flagged).toBe(true);
      expect(result.reasons[0]).toContain('cash');
    });

    it('should detect multiple violations simultaneously', () => {
      const result = service.moderateContent(
        'Contactez john@test.com au 0612345678 via whatsapp',
      );
      expect(result.flagged).toBe(true);
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================================
  // canSendMessage()
  // ============================================================
  describe('canSendMessage()', () => {
    it('should allow clean messages', () => {
      const result = service.canSendMessage(
        'Super figurine, quel est le prix ?',
      );
      expect(result.allowed).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should block messages with personal info', () => {
      const result = service.canSendMessage('Mon email: test@test.com');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('bloqué');
    });
  });

  // ============================================================
  // getSanitizedMessage()
  // ============================================================
  describe('getSanitizedMessage()', () => {
    it('should return original content when clean', () => {
      const msg = 'Belle pièce de collection !';
      expect(service.getSanitizedMessage(msg)).toBe(msg);
    });

    it('should return sanitized content when flagged', () => {
      const result = service.getSanitizedMessage('Écrivez à test@mail.com');
      expect(result).toContain('[EMAIL MASQUÉ]');
    });
  });

  // ============================================================
  // checkUserBehavior()
  // ============================================================
  describe('checkUserBehavior()', () => {
    it('should not warn or ban with few flags', () => {
      const result = service.checkUserBehavior('user-1', 2);
      expect(result.shouldWarn).toBe(false);
      expect(result.shouldBan).toBe(false);
    });

    it('should warn at 3 flags', () => {
      const result = service.checkUserBehavior('user-1', 3);
      expect(result.shouldWarn).toBe(true);
      expect(result.shouldBan).toBe(false);
    });

    it('should ban at 10 flags', () => {
      const result = service.checkUserBehavior('user-1', 10);
      expect(result.shouldWarn).toBe(false);
      expect(result.shouldBan).toBe(true);
    });
  });
});
