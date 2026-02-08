/**
 * Event Bus - Système de messaging découplé pour communication inter-modules
 * Permet d'ajouter de nouvelles features sans modifier le code existant
 */

export type EventHandler<T = Record<string, unknown>> = (
  data: T,
) => void | Promise<void>;

export interface Event<T = Record<string, unknown>> {
  type: string;
  payload: T;
  timestamp: Date;
  source?: string;
}

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize = 100;

  /**
   * Subscribe to an event
   */
  on<T extends Record<string, unknown> = Record<string, unknown>>(
    eventType: string,
    handler: EventHandler<T>,
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers
      .get(eventType)!
      .add(handler as EventHandler<Record<string, unknown>>);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Subscribe to an event (one-time)
   */
  once<T extends Record<string, unknown> = Record<string, unknown>>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const wrapper = (data: T) => {
      void handler(data);
      this.off(eventType, wrapper as EventHandler<Record<string, unknown>>);
    };
    this.on(eventType, wrapper);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit<T extends Record<string, unknown> = Record<string, unknown>>(
    eventType: string,
    payload: T,
    source?: string,
  ): Promise<void> {
    const event: Event<T> = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
    };

    // Store in history
    this.eventHistory.push(event as Event<Record<string, unknown>>);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Call all handlers
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const promises = Array.from(handlers).map((handler) =>
        Promise.resolve(handler(payload as Record<string, unknown>)),
      );
      await Promise.allSettled(promises);
    }
  }

  /**
   * Get event history (for debugging/analytics)
   */
  getHistory(eventType?: string): Event[] {
    if (eventType) {
      return this.eventHistory.filter((e) => e.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear all handlers
   */
  clear(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for an event
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

/**
 * Standard event types - Extensible by modules
 */
export const EventTypes = {
  // Item events
  ITEM_CREATED: 'item.created',
  ITEM_UPDATED: 'item.updated',
  ITEM_DELETED: 'item.deleted',
  ITEM_SOLD: 'item.sold',
  ITEM_PRICE_CHANGED: 'item.priceChanged',
  ITEM_VALIDATED: 'item.validated',

  // User events
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_LOGGED_IN: 'user.loggedIn',

  // Transaction events
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_FAILED: 'transaction.failed',

  // Message events
  MESSAGE_SENT: 'message.sent',
  MESSAGE_RECEIVED: 'message.received',

  // Notification events
  NOTIFICATION_SENT: 'notification.sent',

  // Review events
  REVIEW_CREATED: 'review.created',

  // Shop events
  SHOP_CREATED: 'shop.created',
  SHOP_UPDATED: 'shop.updated',

  // Fraud detection events
  FRAUD_ALERT: 'fraud.alert',

  // Advertising events
  AD_IMPRESSION: 'ad.impression',
  AD_CLICK: 'ad.click',

  // Future extensibility - modules can add their own
  // AUCTION_BID: 'auction.bid',
  // STREAM_STARTED: 'stream.started',
  // CHATBOT_MESSAGE: 'chatbot.message',
} as const;

/**
 * Type-safe event emitter helper
 */
export function createEventEmitter<
  T extends Record<string, unknown> = Record<string, unknown>,
>(eventType: string) {
  return async (payload: T) => {
    await eventBus.emit(eventType, payload);
  };
}

/**
 * Decorator for event listeners (backend)
 */
export function OnEvent(eventType: string) {
  return function (
    target: Record<string, unknown>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as EventHandler;

    // Store metadata for automatic registration
    const constructor = target.constructor as {
      _eventListeners?: Array<{
        eventType: string;
        handler: EventHandler;
        method: string | symbol;
      }>;
    };
    if (!constructor._eventListeners) {
      constructor._eventListeners = [];
    }
    constructor._eventListeners.push({
      eventType,
      handler: originalMethod,
      method: propertyKey,
    });

    return descriptor;
  };
}

export default eventBus;
