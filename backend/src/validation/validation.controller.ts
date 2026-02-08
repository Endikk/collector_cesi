import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { ItemValidationService } from './item-validation.service';

@Controller('validation')
export class ValidationController {
  constructor(private readonly validationService: ItemValidationService) {}

  @Get('rules')
  getValidationRules() {
    return this.validationService.getValidationRules();
  }
}
