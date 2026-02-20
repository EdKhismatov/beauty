import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { RolesUser } from '../../../guards/role.guard';

export class UserCreateDto {
  @ApiProperty({ description: 'Введите свое имя' })
  @IsString()
  @Length(6, 100)
  declare name: string;

  @ApiProperty({ description: 'Введите email' })
  @IsEmail()
  declare email: string;

  @ApiProperty({ format: 'password', description: 'Введите пароль' })
  @IsString()
  @Length(6, 512)
  declare password: string;

  @ApiProperty({ description: 'Выберите роль' })
  @IsString()
  @IsEnum(RolesUser)
  declare role: RolesUser;
}
