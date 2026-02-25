import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateShopSchema = z.object({
  name: z
    .string({ message: 'Le nom est requis' })
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
  description: z
    .string()
    .max(500, { message: 'La description ne peut pas dépasser 500 caractères' })
    .optional(),
  logo: z
    .string()
    .url({ message: 'Le logo doit être une URL valide' })
    .optional(),
});

export type CreateShopInput = z.infer<typeof CreateShopSchema>;

export class CreateShopDto {
  static schema = CreateShopSchema;

  @ApiProperty({
    description: 'Nom de la boutique',
    example: 'Ma Boutique Vintage',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

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
