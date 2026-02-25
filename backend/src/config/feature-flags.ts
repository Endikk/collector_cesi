/**
 * Feature Flags Configuration
 *
 * Control which features are enabled/disabled
 * Useful for:
 * - Gradual rollout
 * - A/B testing
 * - Disabling experimental features
 * - Environment-specific features
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  experimental?: boolean;
  description?: string;
  requiredEnv?: string; // Environment variable required
}

export const featureFlags: Record<string, FeatureFlag> = {
  // Core features (always enabled)
  items: {
    name: 'Items Marketplace',
    enabled: true,
    description: 'Core marketplace functionality',
  },

  shops: {
    name: 'Seller Shops',
    enabled: true,
    description: 'Boutiques for sellers',
  },

  // Security features
  fraudDetection: {
    name: 'Fraud Detection',
    enabled: true,
    description: 'Fraud detection with price history tracking',
  },

  // Monetization features
  advertising: {
    name: 'Advertising API',
    enabled: true,
    description: 'Partner advertising feeds',
  },

  // Internationalization & Accessibility
  i18n: {
    name: 'Internationalization',
    enabled: true,
    description: 'Multi-language support (fr, en, es, de)',
  },

  accessibility: {
    name: 'Accessibility Features',
    enabled: true,
    description: 'WCAG 2.1 AA compliance',
  },

  // Future features (disabled by default)
  auction: {
    name: 'Auction System',
    enabled: process.env.FEATURE_AUCTION === 'true',
    experimental: true,
    description: 'Timed auctions with automatic bidding',
    requiredEnv: 'FEATURE_AUCTION',
  },

  streaming: {
    name: 'Live Streaming',
    enabled: process.env.FEATURE_STREAMING === 'true',
    experimental: true,
    description: 'Live collector events with video streaming',
    requiredEnv: 'FEATURE_STREAMING',
  },

  chatbot: {
    name: 'AI Chatbot',
    enabled: process.env.FEATURE_CHATBOT === 'true',
    experimental: true,
    description: 'AI-powered customer support',
    requiredEnv: 'FEATURE_CHATBOT',
  },

  advancedAnalytics: {
    name: 'Advanced Analytics',
    enabled: process.env.FEATURE_ANALYTICS === 'true',
    experimental: false,
    description: 'Business intelligence and reporting',
    requiredEnv: 'FEATURE_ANALYTICS',
  },

  // Social features
  socialSelling: {
    name: 'Social Selling',
    enabled: false,
    experimental: true,
    description: 'Share items to social media',
  },

  referralProgram: {
    name: 'Referral Program',
    enabled: false,
    experimental: true,
    description: 'Refer friends and earn rewards',
  },

  // Payment features
  cryptoPayments: {
    name: 'Crypto Payments',
    enabled: false,
    experimental: true,
    description: 'Accept cryptocurrency payments',
  },

  subscriptions: {
    name: 'Seller Subscriptions',
    enabled: false,
    experimental: true,
    description: 'Premium seller accounts',
  },
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  featureName: keyof typeof featureFlags,
): boolean {
  const feature = featureFlags[featureName];
  if (!feature) return false;

  // Check if required environment variable is set
  if (feature.requiredEnv && !process.env[feature.requiredEnv]) {
    return false;
  }

  return feature.enabled;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.values(featureFlags).filter((f) => f.enabled);
}

/**
 * Get experimental features
 */
export function getExperimentalFeatures(): FeatureFlag[] {
  return Object.values(featureFlags).filter((f) => f.experimental);
}

/**
 * Get feature metadata for API endpoint
 */
export function getFeatureMetadata() {
  return {
    features: featureFlags,
    enabled: getEnabledFeatures().map((f) => f.name),
    experimental: getExperimentalFeatures().map((f) => f.name),
  };
}

/**
 * Feature guard for NestJS controllers
 *
 * Usage:
 * @UseGuards(FeatureGuard('auction'))
 * @Controller('auctions')
 * export class AuctionController {}
 */
export function createFeatureGuard(featureName: keyof typeof featureFlags) {
  return {
    canActivate: () => {
      if (!isFeatureEnabled(featureName)) {
        throw new Error(`Feature "${featureName}" is not enabled`);
      }
      return true;
    },
  };
}

/**
 * Usage in .env:
 *
 * # Enable experimental features
 * FEATURE_AUCTION=true
 * FEATURE_STREAMING=false
 * FEATURE_CHATBOT=true
 * FEATURE_ANALYTICS=true
 *
 * # Or enable all experimental features
 * ENABLE_EXPERIMENTAL=true
 */

export default featureFlags;
