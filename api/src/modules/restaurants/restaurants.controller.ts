import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NearbyRestaurantsDto } from './dto/nearby-restaurants.dto';
import { RestaurantsService } from './restaurants.service';
import express from 'express';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiTags('Restaurantes')
@ApiBearerAuth('access-token')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // endpoint para buscar restaurantes cercanos basado en ciudad o coordenadas
  @Get('nearby')
  @ApiOperation({
    summary: 'Buscar restaurantes cerca',
    description:
      'Puedes buscar por ciudad o por coordenadas. Si envias una ciudad, el sistema completa latitud y longitud automaticamente.',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    example: 'Bogota',
    description: 'Ciudad donde quieres buscar restaurantes.',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    example: 4.711,
    description: 'Latitud. Usala junto con lng si no envias city.',
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    example: -74.0721,
    description: 'Longitud. Usala junto con lat si no envias city.',
  })
  @ApiOkResponse({
    description: 'Busqueda realizada correctamente.',
    schema: {
      example: {
        search: { city: 'Bogota', lat: 4.711, lng: -74.0721 },
        data: [
          {
            name: 'Restaurante El Patio',
            address: 'Cra 11 #93-77, Bogota',
            lat: 4.672,
            lng: -74.048,
            placeId: '5f65f4ccf7a1b6a4',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Debes enviar city o el par lat/lng. Tambien puede fallar si la ciudad no se encuentra.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, vencido o invalido.',
  })
  findNearby(
    @CurrentUser() user: { sub: number },
    @Query() query: NearbyRestaurantsDto,
    @Req() request: express.Request,
  ) {
    return this.restaurantsService.findNearby(user.sub, query, request);
  }
}
