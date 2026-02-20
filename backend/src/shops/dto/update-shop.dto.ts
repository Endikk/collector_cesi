import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La description ne peut pas dépasser 500 caractères',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Le logo doit être une URL valide' })
  logo?: string;
}
