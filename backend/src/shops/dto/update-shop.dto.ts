import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const UpdateShopSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
    .optional(),
  description: z
    .string()
    .max(500, { message: 'La description ne peut pas dépasser 500 caractères' })
    .optional(),
  logo: z
    .string()
    .url({ message: 'Le logo doit être une URL valide' })
    .optional(),
});

export type UpdateShopInput = z.infer<typeof UpdateShopSchema>;

export class UpdateShopDto {
  static schema = UpdateShopSchema;

  @ApiPropertyOptional({
    description: 'Nom de la boutique',
    example: 'Ma Boutique Vintage',
    minLength: 2,
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description de la boutique',
    example: 'Spécialiste des objets de collection vintage.',
    maxLength: 500,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL du logo de la boutique',
    example: 'https://example.com/logo.png',
  })
  logo?: string;
}
