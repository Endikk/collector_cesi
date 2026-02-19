import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0.01, { message: 'Le prix doit être supérieur à 0' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Les frais de livraison doivent être un nombre' })
  @Min(0, { message: 'Les frais de livraison ne peuvent pas être négatifs' })
  shippingCost?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;
}
