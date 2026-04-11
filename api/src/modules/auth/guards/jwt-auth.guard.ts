import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// valida si el jwt esta en las rutas
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
