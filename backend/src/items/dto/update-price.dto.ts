import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdatePriceSchema = z.object({
  price: z
    .number({ message: 'Le prix doit être un nombre' })
    .min(0.01, { message: 'Le prix doit être supérieur à 0' }),
});

export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;

export class UpdatePriceDto {
  static schema = UpdatePriceSchema;

  @ApiProperty({
    description: "Nouveau prix de l'article en EUR",
    example: 99.99,
    minimum: 0.01,
  })
  price: number;
}
