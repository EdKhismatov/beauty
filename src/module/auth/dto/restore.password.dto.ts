import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RestorePasswordDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  keys: string;

  @IsString()
  @Length(6, 512)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль слишком слабый: добавьте заглавную букву, цифру или спецсимвол',
  })
  newPassword: string;
}
