import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'william.perez@correo.com',
    description: 'Correo principal del usuario para ingresar a la aplicacion.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'William Perez',
    minLength: 2,
    description: 'Nombre que se mostrara en la aplicacion.',
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({
    example: 'MiClaveSegura2026',
    minLength: 8,
    description: 'Contrasena de minimo 8 caracteres.',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
