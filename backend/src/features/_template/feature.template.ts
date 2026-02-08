/**
 * Feature Module Template
 *
 * Copy this template to quickly scaffold new features
 * Replace "Feature" with your feature name (e.g., "Auction", "Streaming")
 */

import {
  Module,
  Injectable,
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusModule } from '../../common/event-bus.module';
import { eventBus, EventTypes } from '../../common/event-bus';
import { IFeatureService, FeatureMetadata } from '../../common/interfaces';

// ============================================================
// 1. SERVICE
// ============================================================

@Injectable()
export class FeatureService implements IFeatureService {
  constructor(private prisma: PrismaService) {
    void this.initialize();
  }

  // IFeatureService implementation
  getName(): string {
    return 'FeatureService';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getMetadata(): FeatureMetadata {
    return {
      name: 'Feature Name',
      version: '1.0.0',
      description: 'Feature description',
      author: 'Team',
      dependencies: [],
      enabled: true,
      experimental: false,
    };
  }

  initialize(): Promise<void> {
    console.log('✅ Initializing Feature Service');

    // Subscribe to relevant events
    eventBus.on(
      EventTypes.ITEM_CREATED,
      this.onItemCreated.bind(this) as (data: Record<string, unknown>) => void,
    );

    return Promise.resolve();
  }

  cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Feature Service');
    return Promise.resolve();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Business logic methods
  async doSomething(data: Record<string, unknown>) {
    // Your logic here
    console.log('Processing data:', data);

    // Emit event when done
    await eventBus.emit('feature.actionCompleted', {
      featureId: 'abc',
      result: 'success',
    });

    return { success: true };
  }

  // Event handlers
  private onItemCreated(data: Record<string, unknown>) {
    console.log('Feature: React to item creation', data);
  }
}

// ============================================================
// 2. CONTROLLER
// ============================================================

@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  list() {
    return { message: 'List features' };
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return { message: `Get feature ${id}` };
  }

  @Post()
  async create(@Body() data: Record<string, unknown>) {
    return this.featureService.doSomething(data);
  }
}

// ============================================================
// 3. MODULE
// ============================================================

@Module({
  imports: [
    EventBusModule, // For event bus access
    // PrismaModule, // Uncomment if using database
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}

// ============================================================
// 4. USAGE IN APP.MODULE.TS
// ============================================================

/*
import { FeatureModule } from './features/feature-name/feature.module';

@Module({
  imports: [
    // ... existing modules
    FeatureModule, // Add your module
  ],
})
export class AppModule {}
*/

// ============================================================
// 5. PRISMA SCHEMA (if needed)
// ============================================================

/*
model Feature {
  id        String   @id @default(cuid())
  name      String
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
*/

// ============================================================
// 6. API ENDPOINTS (automatically available)
// ============================================================

/*
GET    /features       - List all features
GET    /features/:id   - Get feature by ID
POST   /features       - Create feature
PUT    /features/:id   - Update feature
DELETE /features/:id   - Delete feature
*/

// ============================================================
// 7. TESTING
// ============================================================

/*
// feature.service.spec.ts
describe('FeatureService', () => {
  let service: FeatureService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FeatureService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do something', async () => {
    const result = await service.doSomething({ test: true });
    expect(result.success).toBe(true);
  });
});
*/

// ============================================================
// 8. CHECKLIST BEFORE DEPLOYING
// ============================================================

/*
✅ Service implements IFeatureService
✅ Event listeners registered in initialize()
✅ Events emitted for important actions
✅ Controller has proper guards (if needed)
✅ Prisma schema updated (if using DB)
✅ Module exported service
✅ Module added to app.module.ts
✅ Tests written
✅ Documentation updated
✅ Feature flag added (if experimental)
*/
