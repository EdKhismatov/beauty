import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';
import { RolesUser } from '../../../guards/role.guard';

export class UserCreateDto {
  @ApiProperty({ description: 'Введите свое имя' })
  @IsString()
  @Length(6, 100)
  name: string;

  @ApiProperty({ description: 'Введите email' })
  @IsEmail()
  email: string;

  @ApiProperty({ format: 'password', description: 'Введите пароль' })
  @IsString()
  @Length(6, 512)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль слишком слабый: добавьте заглавную букву, цифру или спецсимвол',
  })
  password: string;

  @ApiProperty({ description: 'Выберите роль' })
  @IsString()
  @IsEnum([RolesUser.master, RolesUser.user])
  role: RolesUser;
}
