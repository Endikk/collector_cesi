import { Injectable } from '@nestjs/common';
import { generateSecret, verifySync } from 'otplib';
import { toDataURL } from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  public generateTwoFactorSecret(userEmail: string) {
    const secret = generateSecret();
    const appName = this.configService.get<string>('APP_NAME', 'Collector');
    const label = `${appName}:${userEmail}`;
    // Generate OTPAuth URL manually to ensure compatibility without relying on library specific method signatures
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(appName ?? 'Collector')}&algorithm=SHA1&digits=6&period=30`;

    return {
      secret,
      otpauthUrl,
    };
  }

  public async generateQrCodeDataURL(otpauthUrl: string) {
    return toDataURL(otpauthUrl);
  }

  public verifyTwoFactorToken(token: string, secret: string): boolean {
    // Note: secret passed here acts as "shared secret" for verification.
    // If we were fetching from DB for login, we would decrypt it first.
    // Since enableAndVerify passes the plain secret generated in step 1, we don't need decryption here.

    const result = verifySync({
      token,
      secret,
    });

    // @ts-expect-error Handle potential type mismatch if VerifyResult is not boolean
    return result === true || result?.delta !== undefined;
  }

  public async enableTwoFactor(userId: string, secret: string) {
    const encryptedSecret = this.encryptionService.encrypt(secret);
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorEnabled: true,
      },
    });
  }

  // Method helper to retrieve decrypted secret for verification (e.g. login)
  public async getDecryptedSecret(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      return null;
    }

    return this.encryptionService.decrypt(user.twoFactorSecret);
  }
}
