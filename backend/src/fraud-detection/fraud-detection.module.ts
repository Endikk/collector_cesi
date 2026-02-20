import { Module } from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrometheusConfigModule } from '../common/prometheus.module';

@Module({
  imports: [PrismaModule, PrometheusConfigModule],
  providers: [FraudDetectionService],
  exports: [FraudDetectionService],
})
export class FraudDetectionModule {}
