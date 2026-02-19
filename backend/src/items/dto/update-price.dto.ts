import { IsNumber, Min } from 'class-validator';

export class UpdatePriceDto {
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0.01, { message: 'Le prix doit être supérieur à 0' })
  price: number;
}
