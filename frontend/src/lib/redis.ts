import Redis from "ioredis";

// Create a single Redis connection to reuse
const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

// the main client used for publishing
export const redis = new Redis(redisUrl, {
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});

// a separate client used for subscribing (Redis requires a separate connection for subscriptions)
export const subscriberRedis = new Redis(redisUrl, {
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});
