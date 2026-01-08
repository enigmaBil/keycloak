import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../database/prisma.module';
import { UsersModule } from '../users/users.module';
import { KeycloakStrategy } from 'src/common/strategies/keycloak.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'keycloak' }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, KeycloakStrategy],
  exports: [AuthService],
})
export class AuthModule {}
