import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserActionsService } from './user-actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user-actions')
@UseGuards(JwtAuthGuard)
export class UserActionsController {
  constructor(private readonly userActionsService: UserActionsService) {}
  // endpoint para obtener lo que ha hecho el usuario
  @Get('me')
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
