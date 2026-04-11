import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import express from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
@ApiTags('Autenticacion')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // registro de usuario
  @Post('signup')
  @ApiOperation({
    summary: 'Crear cuenta',
    description:
      'Registra al usuario y devuelve un token para que pueda continuar sin iniciar sesion otra vez.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Usuario creado y autenticado.',
    schema: {
      example: {
        user: {
          id: 12,
          email: 'william.perez@correo.com',
          fullName: 'William Perez',
          createdAt: '2026-04-11T18:30:25.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Hay campos invalidos o incompletos. Revisa email, nombre y contrasena.',
  })
  signup(@Body() dto: CreateUserDto, @Req() request: express.Request) {
    return this.authService.signup(dto, request);
  }

  // login de usuario
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesion',
    description:
      'Valida las credenciales y devuelve un token JWT para usar endpoints protegidos.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login correcto.',
    schema: {
      example: {
        user: {
          id: 12,
          email: 'william.perez@correo.com',
          fullName: 'William Perez',
          createdAt: '2026-04-11T18:30:25.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Correo o contrasena incorrectos.',
  })
  login(@Body() dto: LoginDto, @Req() request: express.Request) {
    return this.authService.login(dto, request);
  }

  // cierre de sesion del usuario
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cerrar sesion',
    description:
      'Registra la salida del usuario autenticado y devuelve una confirmacion.',
  })
  @ApiOkResponse({
    description: 'Sesion cerrada correctamente.',
    schema: { example: { message: 'Sesion cerrada' } },
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, vencido o invalido.',
  })
  logout(
    @CurrentUser() user: { sub: number },
    @Req() request: express.Request,
  ) {
    return this.authService.logout(user.sub, request);
  }
}
