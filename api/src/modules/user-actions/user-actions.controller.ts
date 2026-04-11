import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserActionsService } from './user-actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user-actions')
@UseGuards(JwtAuthGuard)
@ApiTags('Historial')
@ApiBearerAuth('access-token')
export class UserActionsController {
  constructor(private readonly userActionsService: UserActionsService) {}

  // endpoint para obtener lo que ha hecho el usuario
  @Get('me')
  @ApiOperation({
    summary: 'Ver mi actividad',
    description:
      'Devuelve la actividad reciente del usuario autenticado, como signup, login, logout o busquedas.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Numero de pagina (minimo 1).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
    description: 'Cantidad de registros por pagina (1 a 100).',
  })
  @ApiOkResponse({
    description: 'Actividad retornada correctamente.',
    schema: {
      example: {
        data: [
          {
            id: 41,
            userId: 12,
            action: 'LOGIN',
            metadata: null,
            ip: '::1',
            userAgent: 'Mozilla/5.0',
            createdAt: '2026-04-11T18:32:11.000Z',
          },
        ],
        meta: {
          total: 52,
          page: 1,
          limit: 20,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, vencido o invalido.',
  })
  getMyActions(
    @CurrentUser() user: { sub: number },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.userActionsService.findByUser(
      user.sub,
      Number(page),
      Number(limit),
    );
  }
}
