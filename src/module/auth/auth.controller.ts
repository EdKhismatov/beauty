import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Query, Req, Request, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../../guards/jwt.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';
import { ChangePasswordDto, LoginDto, RequestPasswordResetDto, RestorePasswordDto, UserCreateDto } from './dto';
import { TokenDto } from './dto/token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // регистрация
  @ApiCreatedResponse({ description: 'Record created successfully' })
  @ApiOperation({ summary: 'Создание пользователя' })
  @Post('register')
  async register(@Body() body: UserCreateDto) {
    const result = await this.authService.register(body);

    return result;
  }

  // авторизация
  @ApiCreatedResponse({ description: 'user authorization' })
  @ApiOperation({ summary: 'Авторизация пользователя' })
  // @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: FastifyRequest) {
    const ip = req.ip;
    return await this.authService.login(body, ip);
  }

  // логаут
  @ApiCreatedResponse({ description: 'RefreshToken deleted ' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() refreshToken: TokenDto) {
    await this.authService.logout(refreshToken.token);
    return true;
  }

  // Удаление рефреш токена
  @ApiCreatedResponse({ description: 'RefreshToken deleted ' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async profile(@Request() req: AuthenticatedRequest) {
    return await this.authService.profile(req.user.id);
  }

  @ApiCreatedResponse({ description: 'New refreshtoken and accesstoken' })
  @ApiResponse({ status: 200, description: 'Успешно созданы refresh и access токен' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshToken: TokenDto) {
    return await this.authService.refresh(refreshToken);
  }

  // Подтверждение почты
  @ApiCreatedResponse({ description: 'Email confirmed' })
  @ApiResponse({ status: 200, description: 'Почта подтверждена' })
  @HttpCode(HttpStatus.OK)
  @Get('verify')
  async confirms(@Query('token') token: string) {
    console.log('token', token);
    return await this.authService.confirms(token);
  }

  // Изменениние пароля
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Сhange password' })
  @ApiResponse({ status: 200, description: 'Пароль изменен' })
  @HttpCode(HttpStatus.OK)
  @Put('change')
  async change(@Body() body: ChangePasswordDto) {
    return await this.authService.change(body);
  }

  // отправка кода для восстановления почты
  @ApiCreatedResponse({ description: 'Sending a password recovery code' })
  @ApiResponse({ status: 200, description: 'Код отправлен' })
  @HttpCode(HttpStatus.OK)
  @Post('restore')
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return await this.authService.requestPasswordReset(body);
  }

  // восстановление пароля с кодом подтверждения
  @ApiCreatedResponse({ description: 'Reinstatement of the president' })
  @ApiResponse({ status: 200, description: 'Пароль обновлен' })
  @HttpCode(HttpStatus.OK)
  @Post('change')
  async restorePassword(@Body() body: RestorePasswordDto) {
    return await this.authService.restorePassword(body);
  }
}
