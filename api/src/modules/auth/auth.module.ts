import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { UserActionsModule } from '../user-actions/user-actions.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    UserActionsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      //// si no viene tiempo de expiracion usamos 24h por default
      useFactory: (config: ConfigService): JwtModuleOptions => {
        return {
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('JWT_EXPIRES_IN') ?? '24h',
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
