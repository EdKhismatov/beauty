import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Query, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { RolesUser } from '../../guards/role.guard';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  LoginDto,
  RequestPasswordResetDto,
  RestorePasswordDto,
  TokenDto,
  UserCreateDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // регистрация
  @Public()
  @ApiCreatedResponse({ description: 'Record created successfully' })
  @ApiOperation({ summary: 'Создание пользователя' })
  @Post('register')
  async register(@Body() body: UserCreateDto) {
    const result = await this.authService.register(body);

    return result;
  }

  // авторизация
  @Public()
  @ApiCreatedResponse({ description: 'user authorization' })
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: FastifyRequest) {
    const ip = req.ip;
    return await this.authService.login(body, ip);
  }

  // логаут
  @Public()
  @ApiCreatedResponse({ description: 'RefreshToken deleted ' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() refreshToken: TokenDto) {
    await this.authService.logout(refreshToken.token);
    return true;
  }

  // Профиль
  @ApiCreatedResponse({ description: 'Profile' })
  @ApiResponse({ status: 200, description: 'Получение юзера' })
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async profile(@User('id') id: string) {
    return await this.authService.profile(id);
  }

  // refresh
  @Public()
  @ApiCreatedResponse({ description: 'New refreshtoken and accesstoken' })
  @ApiResponse({ status: 200, description: 'Успешно созданы refresh и access токен' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshToken: TokenDto) {
    return await this.authService.refresh(refreshToken);
  }

  // Подтверждение почты
  @Public()
  @ApiCreatedResponse({ description: 'Email confirmed' })
  @ApiResponse({ status: 200, description: 'Почта подтверждена' })
  @HttpCode(HttpStatus.OK)
  @Get('verify')
  async confirms(@Query('token') token: string) {
    return await this.authService.confirms(token);
  }

  // Изменение пароля
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @ApiCreatedResponse({ description: 'Сhange password' })
  @ApiResponse({ status: 200, description: 'Пароль изменен' })
  @HttpCode(HttpStatus.OK)
  @Put('change')
  async change(@Body() body: ChangePasswordDto, @User('id') id: string) {
    return await this.authService.change(body, id);
  }

  // отправка кода для восстановления пароля
  @Public()
  @ApiCreatedResponse({ description: 'Sending a password recovery code' })
  @ApiResponse({ status: 200, description: 'Код отправлен' })
  @HttpCode(HttpStatus.OK)
  @Post('restore')
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return await this.authService.requestPasswordReset(body);
  }

  // восстановление пароля с кодом подтверждения
  @Public()
  @ApiCreatedResponse({ description: 'Reinstatement of the president' })
  @ApiResponse({ status: 200, description: 'Пароль обновлен' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async restorePassword(@Body() body: RestorePasswordDto) {
    return await this.authService.restorePassword(body);
  }
}
