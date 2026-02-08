/**
 * EXAMPLE: Integration of Event Bus in existing module
 *
 * This shows how to update ItemsService to emit events
 */

import { eventBus, EventTypes } from '../common/event-bus';

// Original ItemsService would look like this:
// export class ItemsService {
//   async create(data: CreateItemDto) {
//     const item = await this.prisma.item.create({ data });
//     return item;
//   }
// }

// ✅ UPDATED with Event Bus:
export class ItemsServiceWithEvents {
  async create(data: Record<string, unknown>) {
    // Original logic
    // const item = await this.prisma.item.create({ data });
    console.log('Creating item with data:', data);

    const item = { id: 'item_123', title: 'Example', price: 99.99 };

    // ✅ Emit event for other modules to react
    await eventBus.emit(EventTypes.ITEM_CREATED, {
      itemId: item.id,
      // title: item.title,
      price: item.price,
      // sellerId: item.sellerId,
    });

    // Other modules can now listen:
    // - RecommendationsModule: Update recommendations
    // - NotificationsModule: Notify followers
    // - AdvertisingModule: Send to partner feeds
    // - AnalyticsModule: Track item creation
    // - AuctionModule: Suggest auction for high-value items

    return item;
  }

  async update(id: string, data: Record<string, unknown>) {
    // const item = await this.prisma.item.update({ where: { id }, data });

    const item = { id, price: data.price };

    // Track price changes
    // if (data.price && data.price !== oldPrice) {
    await eventBus.emit(EventTypes.ITEM_PRICE_CHANGED, {
      itemId: id,
      oldPrice: 89.99,
      newPrice: data.price,
    });
    // }

    await eventBus.emit(EventTypes.ITEM_UPDATED, {
      itemId: id,
      changes: Object.keys(data),
    });

    return item;
  }

  async markAsSold(id: string, buyerId: string) {
    // const item = await this.prisma.item.update({
    //   where: { id },
    //   data: { status: 'SOLD', buyerId }
    // });

    const item = { id, buyerId };

    // ✅ Emit ITEM_SOLD event
    await eventBus.emit(EventTypes.ITEM_SOLD, {
      itemId: id,
      buyerId,
      // sellerId: item.sellerId,
      price: 99.99,
      timestamp: new Date(),
    });

    // Modules listening to ITEM_SOLD:
    // - NotificationsModule: Notify seller & buyer
    // - PaymentModule: Process commission
    // - AnalyticsModule: Record sale
    // - RecommendationsModule: Update user preferences
    // - FraudDetectionModule: Check for suspicious patterns

    return item;
  }
}

/**
 * MODULE INTEGRATION EXAMPLES
 */

// Example 1: NotificationsModule listens to item events
export class NotificationsModuleExample {
  constructor() {
    // Subscribe to item sold events
    eventBus.on(
      EventTypes.ITEM_SOLD,
      this.handleItemSold.bind(this) as (data: Record<string, unknown>) => void,
    );
    eventBus.on(
      EventTypes.ITEM_PRICE_CHANGED,
      this.handlePriceChange.bind(this) as (
        data: Record<string, unknown>,
      ) => void,
    );
  }

  private handleItemSold(data: Record<string, unknown>) {
    console.log('📧 Sending notifications for item sold:', data.itemId);
    // await this.notificationService.notifySeller(data.sellerId, 'Item sold!');
    // await this.notificationService.notifyBuyer(data.buyerId, 'Purchase confirmed!');
  }

  private handlePriceChange(data: Record<string, unknown>) {
    console.log('💰 Price changed:', data);
    // Notify users who favorited the item
    // await this.notificationService.notifyWatchers(data.itemId, 'Price drop!');
  }
}

// Example 2: AnalyticsModule tracks all events
export class AnalyticsModuleExample {
  constructor() {
    // Subscribe to multiple events
    eventBus.on(
      EventTypes.ITEM_CREATED,
      this.trackItemCreated.bind(this) as (
        data: Record<string, unknown>,
      ) => void,
    );
    eventBus.on(
      EventTypes.ITEM_SOLD,
      this.trackSale.bind(this) as (data: Record<string, unknown>) => void,
    );
    eventBus.on(
      EventTypes.USER_REGISTERED,
      this.trackUserRegistration.bind(this) as (
        data: Record<string, unknown>,
      ) => void,
    );
  }

  private trackItemCreated(data: Record<string, unknown>) {
    console.log('📊 Analytics: Item created', data);
    // Store in time-series database
    // await this.timeSeriesDb.record('item_created', { timestamp: Date.now(), ...data });
  }

  private trackSale(data: Record<string, unknown>) {
    console.log('📊 Analytics: Sale completed', data);
    // Update GMV, revenue metrics
    // await this.metricsService.incrementGMV(data.price);
  }

  private trackUserRegistration(data: Record<string, unknown>) {
    console.log('📊 Analytics: New user', data);
    // Track user acquisition
  }
}

// Example 3: FraudDetectionModule monitors suspicious patterns
export class FraudDetectionModuleExample {
  constructor() {
    eventBus.on(
      EventTypes.ITEM_SOLD,
      this.checkSuspiciousSale.bind(this) as (
        data: Record<string, unknown>,
      ) => void,
    );
    eventBus.on(
      EventTypes.ITEM_PRICE_CHANGED,
      this.checkPriceManipulation.bind(this) as (
        data: Record<string, unknown>,
      ) => void,
    );
  }

  private checkSuspiciousSale(data: Record<string, unknown>) {
    console.log('🔍 Fraud check: Sale', data);
    // Check if seller and buyer are related
    // Check if price is suspiciously low/high
    // if (suspicious) {
    //   await eventBus.emit(EventTypes.FRAUD_ALERT, { ... });
    // }
  }

  private checkPriceManipulation(data: Record<string, unknown>) {
    console.log('🔍 Fraud check: Price change', data);
    // Check for rapid price changes
    // Check if price dropped significantly before sale
  }
}

/**
 * SUMMARY
 *
 * Adding Event Bus to existing modules:
 *
 * 1. Import event bus:
 *    import { eventBus, EventTypes } from '../common/event-bus';
 *
 * 2. Emit events after actions:
 *    await eventBus.emit(EventTypes.ITEM_CREATED, { itemId, price });
 *
 * 3. Listen to events in constructor/onModuleInit:
 *    eventBus.on(EventTypes.ITEM_SOLD, this.handleItemSold.bind(this));
 *
 * 4. Benefits:
 *    ✅ No need to import other services
 *    ✅ Loose coupling between modules
 *    ✅ Easy to add new listeners
 *    ✅ Existing code still works
 *    ✅ Can migrate gradually
 */
