import { register, collectDefaultMetrics } from 'prom-client';

// Initialize default metrics collection
// This should only be called once
if (process.env.NODE_ENV !== 'test') {
    try {
        collectDefaultMetrics({ register });
    } catch (e) {
        // Prevent multiple registrations in dev mode
        console.warn('Metrics already registered');
    }
}

export { register };
