import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TwoFactorService } from './two-factor.service';
import { EncryptionService } from '../common/encryption.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, TwoFactorService, EncryptionService],
  exports: [UsersService, TwoFactorService],
})
export class UsersModule {}
