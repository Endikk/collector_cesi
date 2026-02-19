import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (this as any).$metrics.prometheus = async () => {
      const metrics = await (this as any).$metrics.json() as any;
      return `prisma_client_queries_active ${metrics.counters.active_transactions}
prisma_client_queries_total ${metrics.counters.total_queries}
prisma_client_queries_duration_histogram_bucket 0`; // Simplified for now, or use prisma-prometheus for real integration
    };
  }
}
