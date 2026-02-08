'use client';

import { useEffect, useState } from 'react';
import { eventBus, ClientEventTypes, useEventBus, useEmitEvent } from '@/lib/event-bus';

/**
 * EXAMPLE COMPONENT: Using Event Bus in React
 * 
 * This demonstrates how to use the event bus for:
 * - Real-time notifications
 * - Component communication
 * - Global state updates
 */

export function EventBusExamples() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const emit = useEmitEvent();

  // Listen to multiple events
  useEventBus(ClientEventTypes.NOTIFICATION_RECEIVED, (data: { message: string }) => {
    setNotifications((prev) => [...prev, data.message]);
  });

  useEventBus(ClientEventTypes.ITEM_CREATED, () => {
    setItemCount((prev) => prev + 1);
  });

  useEventBus(ClientEventTypes.ITEM_SOLD, (data: unknown) => {
    console.log('Item sold:', data);
    // Could show toast notification, confetti animation, etc.
  });

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Event Bus Demo</h2>
        
        {/* Notifications display */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Notifications ({notifications.length})</h3>
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <div key={i} className="bg-blue-50 p-2 rounded">
                {notif}
              </div>
            ))}
          </div>
        </div>

        {/* Item counter */}
        <div className="mb-4">
          <p className="text-gray-700">
            Items created: <span className="font-bold">{itemCount}</span>
          </p>
        </div>

        {/* Emit events buttons */}
        <div className="space-x-2">
          <button
            onClick={() => emit(ClientEventTypes.NOTIFICATION_RECEIVED, {
              message: 'New notification!',
            })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Notification
          </button>

          <button
            onClick={() => emit(ClientEventTypes.ITEM_CREATED, {
              itemId: Math.random().toString(),
            })}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Item
          </button>

          <button
            onClick={() => emit(ClientEventTypes.ITEM_SOLD, {
              itemId: 'item_123',
              price: 99.99,
            })}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Simulate Sale
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * EXAMPLE: Cart component listening to events
 */
export function CartComponent() {
  const [cartCount, setCartCount] = useState(0);

  // Listen to cart events
  useEventBus(ClientEventTypes.CART_ITEM_ADDED, () => {
    setCartCount((prev) => prev + 1);
  });

  useEventBus(ClientEventTypes.CART_ITEM_REMOVED, () => {
    setCartCount((prev) => Math.max(0, prev - 1));
  });

  useEventBus(ClientEventTypes.CART_CLEARED, () => {
    setCartCount(0);
  });

  return (
    <div className="relative">
      <button className="relative p-2">
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * EXAMPLE: Product card emitting events
 */
export function ProductCard({ itemId, price }: { itemId: string; price: number }) {
  const emit = useEmitEvent();

  const handleAddToCart = () => {
    emit(ClientEventTypes.CART_ITEM_ADDED, { itemId, price });
    
    // Optional: Also track analytics
    emit('analytics.addToCart', {
      itemId,
      price,
      timestamp: Date.now(),
    });
  };

  const handleAddToWishlist = () => {
    emit(ClientEventTypes.WISHLIST_ITEM_ADDED, { itemId });
  };

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">Product {itemId}</h3>
      <p className="text-gray-600">${price}</p>
      
      <div className="mt-2 space-x-2">
        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Add to Cart
        </button>
        <button
          onClick={handleAddToWishlist}
          className="bg-gray-200 px-3 py-1 rounded text-sm"
        >
          ❤️
        </button>
      </div>
    </div>
  );
}

/**
 * EXAMPLE: Global event logger (for debugging)
 */
export function EventLogger() {
  const [events, setEvents] = useState<Array<{ type: string; data: unknown; timestamp: Date }>>([]);

  useEffect(() => {
    // Log all events
    const allEventTypes = Object.values(ClientEventTypes);
    const unsubscribers = allEventTypes.map((type) =>
      eventBus.on(type, (data) => {
        setEvents((prev) => [
          { type, data, timestamp: new Date() },
          ...prev.slice(0, 49), // Keep last 50 events
        ]);
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md max-h-96 overflow-y-auto">
      <h4 className="font-bold mb-2">Event Log 🔍</h4>
      <div className="space-y-1 text-xs">
        {events.map((event, i) => (
          <div key={i} className="border-b pb-1">
            <span className="font-semibold">{event.type}</span>
            <span className="text-gray-500 ml-2">
              {event.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * EXAMPLE: WebSocket integration (future)
 */
export function useWebSocketEvents() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Connect to WebSocket server
    // const ws = new WebSocket('ws://localhost:4000/ws');

    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   
    //   // Forward backend events to frontend event bus
    //   eventBus.emit(data.type, data.payload);
    // };

    // return () => ws.close();
  }, []);
}

/**
 * USAGE IN LAYOUT:
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <EventLogger />  // Only in dev
 *         <WebSocketProvider />  // Real-time backend events
 *       </body>
 *     </html>
 *   );
 * }
 */
