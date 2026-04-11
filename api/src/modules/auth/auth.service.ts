import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { UserActionsService } from '../user-actions/user-actions.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userActionsService: UserActionsService,
    private readonly jwtService: JwtService,
  ) {}
  // registro de usuario y se genera el token
  async signup(dto: CreateUserDto, request?: Request) {
    const user = await this.usersService.create(dto);
    const accessToken = await this.generateToken(user.id, user.email);

    await this.userActionsService.register({
      userId: user.id,
      action: ActionType.SIGNUP,
      metadata: { email: user.email },
      ip: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return { user, accessToken };
  }
  // login de usuario y se genera el token
  async login(dto: LoginDto, request?: Request) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales invalidas');

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isValidPassword)
      throw new UnauthorizedException('Credenciales invalidas');

    const accessToken = await this.generateToken(user.id, user.email);

    await this.userActionsService.register({
      userId: user.id,
      action: ActionType.LOGIN,
      ip: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }
  // cierre de sesion del usuario
  async logout(userId: number, request?: Request) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    await this.userActionsService.register({
      userId,
      action: ActionType.LOGOUT,
      ip: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return { message: 'Sesion cerrada' };
  }
  //genera el token
  private generateToken(userId: number, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }
}
