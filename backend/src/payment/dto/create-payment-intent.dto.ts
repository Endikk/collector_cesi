import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty({ message: "L'identifiant de l'article est requis" })
  itemId: string;

  @IsString()
  @IsNotEmpty({ message: "L'identifiant de l'acheteur est requis" })
  buyerId: string;
}
