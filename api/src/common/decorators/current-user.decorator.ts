import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as express from 'express';
// decorador para obtener el usuario actual desde el request
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<express.Request>();
    return request.user as { sub: number; email: string };
  },
);
