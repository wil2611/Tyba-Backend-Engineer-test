import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // registro de usuario
  @Post('signup')
  signup(@Body() dto: CreateUserDto, @Req() request: express.Request) {
    return this.authService.signup(dto, request);
  }
  // login de usuario
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: express.Request) {
    return this.authService.login(dto, request);
  }
  // cierre de sesion del usuario
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(
    @CurrentUser() user: { sub: number },
    @Req() request: express.Request,
  ) {
    return this.authService.logout(user.sub, request);
  }
}
