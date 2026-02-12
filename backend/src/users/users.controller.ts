import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TwoFactorService } from './two-factor.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly twoFactorService: TwoFactorService,
  ) { }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Post('2fa/generate')
  async generateTwoFactor(@Body() body: { email: string }) {
    const { secret, otpauthUrl } =
      await this.twoFactorService.generateTwoFactorSecret(body.email);
    const qrCodeUrl =
      await this.twoFactorService.generateQrCodeDataURL(otpauthUrl);
    return { secret, qrCodeUrl };
  }

  @Post('2fa/enable')
  async enableTwoFactor(
    @Body() body: { userId: string; token: string; secret: string },
  ) {
    const isValid = this.twoFactorService.verifyTwoFactorToken(
      body.token,
      body.secret,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    await this.twoFactorService.enableTwoFactor(body.userId, body.secret);
    return { success: true };
  }

  @Post('2fa/verify')
  async verifyTwoFactor(
    @Body() body: { token: string; secret: string },
  ) {
    const isValid = this.twoFactorService.verifyTwoFactorToken(
      body.token,
      body.secret,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    return { success: true };
  }
}
