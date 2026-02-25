import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .max(128),
  name: z
    .string()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(100),
  bio: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export class RegisterDto {
  static schema = RegisterSchema;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (8-128 caractères)',
    example: 'SecureP@ss123',
    minLength: 8,
    maxLength: 128,
  })
  password: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'Jean Dupont',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiPropertyOptional({
    description: "Biographie de l'utilisateur",
    example: 'Collectionneur passionné de figurines vintage.',
  })
  bio?: string;
}
