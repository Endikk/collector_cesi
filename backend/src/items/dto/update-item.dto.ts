import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const UpdateItemSchema = z.object({
  title: z
    .string()
    .max(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
    .optional(),
  description: z
    .string()
    .max(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
    .optional(),
  price: z
    .number({ message: 'Le prix doit être un nombre' })
    .min(0.01, { message: 'Le prix doit être supérieur à 0' })
    .optional(),
  shippingCost: z
    .number({ message: 'Les frais de livraison doivent être un nombre' })
    .min(0, { message: 'Les frais de livraison ne peuvent pas être négatifs' })
    .optional(),
  categoryId: z.string().optional(),
  shopId: z.string().optional(),
});

export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;

export class UpdateItemDto {
  static schema = UpdateItemSchema;

  @ApiPropertyOptional({
    description: "Titre de l'article",
    example: 'Figurine Star Wars vintage',
    maxLength: 200,
  })
  title?: string;

  @ApiPropertyOptional({
    description: "Description détaillée de l'article",
    example: "Figurine originale de 1977, en excellent état, avec emballage d'origine.",
    maxLength: 2000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Prix de l'article en EUR",
    example: 150.0,
    minimum: 0.01,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Frais de livraison en EUR',
    example: 5.99,
    minimum: 0,
  })
  shippingCost?: number;

  @ApiPropertyOptional({
    description: 'ID de la catégorie',
    example: 'clx123...',
  })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'ID de la boutique',
    example: 'clx456...',
  })
  shopId?: string;
}
