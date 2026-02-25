/**
 * Event Bus - Frontend version
 * 
 * Client-side event system for React components
 * Synchronizes with backend events via WebSocket (future)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler<T = any> = (data: T) => void | Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ClientEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
}

class ClientEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: ClientEvent[] = [];
  private maxHistorySize = 50;

  /**
   * Subscribe to an event
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Subscribe to an event (one-time)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once<T = any>(eventType: string, handler: EventHandler<T>): void {
    const wrapper = (data: T) => {
      handler(data);
      this.off(eventType, wrapper);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit<T = any>(eventType: string, payload: T): void {
    const event: ClientEvent<T> = {
      type: eventType,
      payload,
      timestamp: new Date(),
    };

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Call all handlers
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get event history
   */
  getHistory(eventType?: string): ClientEvent[] {
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
}

// Singleton instance
export const eventBus = new ClientEventBus();

/**
 * Frontend event types
 */
export const ClientEventTypes = {
  // UI events
  MODAL_OPENED: 'ui.modalOpened',
  MODAL_CLOSED: 'ui.modalClosed',
  THEME_CHANGED: 'ui.themeChanged',
  LANGUAGE_CHANGED: 'ui.languageChanged',

  // Item events (from backend)
  ITEM_CREATED: 'item.created',
  ITEM_UPDATED: 'item.updated',
  ITEM_SOLD: 'item.sold',

  // User events
  USER_LOGGED_IN: 'user.loggedIn',
  USER_LOGGED_OUT: 'user.loggedOut',

  // Notification events
  NOTIFICATION_RECEIVED: 'notification.received',

  // Cart events
  CART_ITEM_ADDED: 'cart.itemAdded',
  CART_ITEM_REMOVED: 'cart.itemRemoved',
  CART_CLEARED: 'cart.cleared',

  // Wishlist events
  WISHLIST_ITEM_ADDED: 'wishlist.itemAdded',
  WISHLIST_ITEM_REMOVED: 'wishlist.itemRemoved',

  // Future extensibility
  // AUCTION_BID: 'auction.bid',
  // STREAM_STARTED: 'stream.started',
  // CHATBOT_MESSAGE: 'chatbot.message',
} as const;

/**
 * React Hook for event subscription
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventBus<T = any>(
  eventType: string,
  handler: EventHandler<T>,
  deps: unknown[] = []
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require('react');

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR safety
    const unsubscribe = eventBus.on(eventType, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * React Hook to emit events
 */
export function useEmitEvent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T = any>(eventType: string, payload: T) => {
    eventBus.emit(eventType, payload);
  };
}

/**
 * Example usage in components:
 * 
 * // Listen to events
 * useEventBus('item.sold', (data) => {
 *   toast.success(`Item ${data.itemId} sold!`);
 * });
 * 
 * // Emit events
 * const emit = useEmitEvent();
 * emit('cart.itemAdded', { itemId: '123', price: 99.99 });
 * 
 * // One-time listener
 * eventBus.once('user.loggedIn', (user) => {
 *   console.log('Welcome!', user);
 * });
 */

export default eventBus;
