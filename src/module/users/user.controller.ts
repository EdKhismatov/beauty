import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { RolesUser } from '../../guards/role.guard';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // изменение имени и города
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @ApiCreatedResponse({ description: 'User data has been updated.' })
  @ApiOperation({ summary: 'Изменение имени и(или) города' })
  @Patch('me')
  async updateUser(@Body() body: UserUpdateDto, @User('id') id: string) {
    return await this.userService.updateUser(body, id);
  }

  // удаление аккаунта
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @ApiCreatedResponse({ description: 'Account deleted' })
  @ApiOperation({ summary: 'Удаление аккаунта' })
  @Delete('me')
  async deleteUser(@User('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  // все пользователи
  @Roles([RolesUser.admin])
  @ApiCreatedResponse({ description: 'All users' })
  @ApiOperation({ summary: 'Получение всех пользователей' })
  @Get('')
  async getAllUser(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('active') active?: boolean,
  ) {
    return await this.userService.getAllUser(page, limit, active);
  }

  // Страницв профиля для админа
  @Roles([RolesUser.admin])
  @ApiCreatedResponse({ description: 'User loaded' })
  @ApiOperation({ summary: 'Страница любого пользователя для админа' })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  // загрузка фото для аватара
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @ApiCreatedResponse({ description: 'photo uploaded successfully' })
  @ApiOperation({ summary: 'Загрузка аватара' })
  @Patch('me/avatar')
  async updateAvatar(@User('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }
    return await this.userService.updateAvatar(id, file);
  }

  // удаление аватара
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @ApiCreatedResponse({ description: 'avatar removed' })
  @ApiOperation({ summary: 'Удаление аватарки' })
  @Delete('me/avatar')
  async deleteAvatar(@User('id') id: string) {
    return await this.userService.deleteAvatar(id);
  }

  // блокировка юзера
  @Roles([RolesUser.admin])
  @ApiOperation({ summary: 'Блокировка/разблокировка пользователя' })
  @Patch(':id/block')
  async toggleBlock(@Param('id') id: string) {
    return await this.userService.toggleBlock(id);
  }
}
