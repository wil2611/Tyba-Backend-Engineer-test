import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  //creamos  nuevo usuario
  async create(dto: CreateUserDto) {
    const { email, fullName, password } = dto;

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      return await this.prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          fullName: fullName.trim().replace(/\s+/g, ' '),
          passwordHash,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        // error dato repetido, el email ya esta registrado
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El correo ya esta registrado');
      }
      throw error;
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }
}
