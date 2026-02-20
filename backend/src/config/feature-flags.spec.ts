import {
  featureFlags,
  isFeatureEnabled,
  getEnabledFeatures,
  getExperimentalFeatures,
  getFeatureMetadata,
  createFeatureGuard,
} from './feature-flags';

describe('Feature Flags', () => {
  describe('featureFlags', () => {
    it('should define core features as enabled', () => {
      expect(featureFlags.items.enabled).toBe(true);
      expect(featureFlags.shops.enabled).toBe(true);
      expect(featureFlags.fraudDetection.enabled).toBe(true);
      expect(featureFlags.advertising.enabled).toBe(true);
      expect(featureFlags.i18n.enabled).toBe(true);
    });

    it('should define experimental features', () => {
      expect(featureFlags.auction.experimental).toBe(true);
      expect(featureFlags.streaming.experimental).toBe(true);
      expect(featureFlags.chatbot.experimental).toBe(true);
    });

    it('should have disabled features', () => {
      expect(featureFlags.socialSelling.enabled).toBe(false);
      expect(featureFlags.referralProgram.enabled).toBe(false);
      expect(featureFlags.cryptoPayments.enabled).toBe(false);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled features', () => {
      expect(isFeatureEnabled('items')).toBe(true);
      expect(isFeatureEnabled('shops')).toBe(true);
    });

    it('should return false for disabled features', () => {
      expect(isFeatureEnabled('socialSelling')).toBe(false);
      expect(isFeatureEnabled('cryptoPayments')).toBe(false);
    });

    it('should return false for unknown features', () => {
      expect(isFeatureEnabled('nonExistent' as any)).toBe(false);
    });

    it('should check env var for features with requiredEnv', () => {
      // Without env var set, auction should be disabled
      delete process.env.FEATURE_AUCTION;
      expect(isFeatureEnabled('auction')).toBe(false);
    });
  });

  describe('getEnabledFeatures', () => {
    it('should return only enabled features', () => {
      const enabled = getEnabledFeatures();
      expect(enabled.every((f) => f.enabled)).toBe(true);
      expect(enabled.length).toBeGreaterThan(0);
    });

    it('should include core features', () => {
      const enabled = getEnabledFeatures();
      const names = enabled.map((f) => f.name);
      expect(names).toContain('Items Marketplace');
      expect(names).toContain('Seller Shops');
    });
  });

  describe('getExperimentalFeatures', () => {
    it('should return experimental features', () => {
      const experimental = getExperimentalFeatures();
      expect(experimental.every((f) => f.experimental)).toBe(true);
    });

    it('should include known experimental features', () => {
      const experimental = getExperimentalFeatures();
      const names = experimental.map((f) => f.name);
      expect(names).toContain('Auction System');
      expect(names).toContain('Live Streaming');
      expect(names).toContain('AI Chatbot');
    });
  });

  describe('getFeatureMetadata', () => {
    it('should return features, enabled list, and experimental list', () => {
      const meta = getFeatureMetadata();
      expect(meta).toHaveProperty('features');
      expect(meta).toHaveProperty('enabled');
      expect(meta).toHaveProperty('experimental');
      expect(Array.isArray(meta.enabled)).toBe(true);
      expect(Array.isArray(meta.experimental)).toBe(true);
    });
  });

  describe('createFeatureGuard', () => {
    it('should allow activation of enabled feature', () => {
      const guard = createFeatureGuard('items');
      expect(guard.canActivate()).toBe(true);
    });

    it('should throw for disabled feature', () => {
      const guard = createFeatureGuard('socialSelling');
      expect(() => guard.canActivate()).toThrow(
        'Feature "socialSelling" is not enabled',
      );
    });
  });
});
