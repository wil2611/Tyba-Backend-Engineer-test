import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'william.perez@correo.com',
    description: 'Correo con el que el usuario se registro.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'MiClaveSegura2026',
    minLength: 8,
    description: 'Contrasena del usuario.',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
