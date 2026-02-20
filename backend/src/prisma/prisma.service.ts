import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    // Prometheus metrics endpoint for Prisma - simplified implementation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (this as any).$metrics = {
      prometheus: () => {
        return `prisma_client_queries_active 0
prisma_client_queries_total 0
prisma_client_queries_duration_histogram_bucket 0`;
      },
    };
  }
}
