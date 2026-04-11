import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NearbyRestaurantsDto } from './dto/nearby-restaurants.dto';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) { }
    // endpoint para buscar restaurantes cercanos basado en ciudad o coordenadas
    @Get('nearby')
    findNearby(
        @CurrentUser() user: { sub: number },
        @Query() query: NearbyRestaurantsDto,
    ) {
        return this.restaurantsService.findNearby(user.sub, query);
    }
}
