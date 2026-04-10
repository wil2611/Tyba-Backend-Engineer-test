import { Injectable } from '@nestjs/common';
import { ActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type RegisterUserActionInput = {
  userId: number;
  action: ActionType;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class UserActionsService {
  constructor(private readonly prisma: PrismaService) {}

  register(input: RegisterUserActionInput) {
    return this.prisma.userAction.create({
      data: {
        userId: input.userId,
        action: input.action,
        metadata: input.metadata,
        ip: input.ip?.slice(0, 64),
        userAgent: input.userAgent?.slice(0, 255),
      },
    });
  }

  async findByUser(userId: number, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      this.prisma.userAction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.userAction.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
    };
  }
}
