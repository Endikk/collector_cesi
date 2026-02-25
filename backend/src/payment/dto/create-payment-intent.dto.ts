import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreatePaymentIntentSchema = z.object({
  itemId: z
    .string({ message: "L'identifiant de l'article est requis" })
    .min(1, { message: "L'identifiant de l'article est requis" }),
  buyerId: z
    .string({ message: "L'identifiant de l'acheteur est requis" })
    .min(1, { message: "L'identifiant de l'acheteur est requis" }),
});

export type CreatePaymentIntentInput = z.infer<
  typeof CreatePaymentIntentSchema
>;

export class CreatePaymentIntentDto {
  static schema = CreatePaymentIntentSchema;

  @ApiProperty({
    description: "Identifiant de l'article à acheter",
    example: 'clx123...',
  })
  itemId: string;

  @ApiProperty({
    description: "Identifiant de l'acheteur",
    example: 'clx456...',
  })
  buyerId: string;
}
