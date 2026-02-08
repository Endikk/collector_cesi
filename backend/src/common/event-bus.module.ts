import { Module, Global, OnModuleInit } from '@nestjs/common';
import { eventBus } from './event-bus';

/**
 * Event Bus Module - Global module for event-driven architecture
 * Makes event bus available to all modules
 */
@Global()
@Module({
  providers: [
    {
      provide: 'EVENT_BUS',
      useValue: eventBus,
    },
  ],
  exports: ['EVENT_BUS'],
})
export class EventBusModule implements OnModuleInit {
  onModuleInit() {
    console.log('✅ Event Bus initialized');
    console.log(
      `📢 Registered event types: ${eventBus.getEventTypes().length}`,
    );
  }
}
