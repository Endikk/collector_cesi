import { Module } from '@nestjs/common';
import { ItemValidationService } from './item-validation.service';
import { ValidationController } from './validation.controller';

@Module({
  controllers: [ValidationController],
  providers: [ItemValidationService],
  exports: [ItemValidationService],
})
export class ValidationModule {}
