import { Module } from '@nestjs/common';
import { UserActionsService } from './user-actions.service';

@Module({
  providers: [UserActionsService],
  exports: [UserActionsService],
})
export class UserActionsModule {}
