import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export class LoginDto {
  static schema = LoginSchema;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'SecureP@ss123',
  })
  password: string;
}
