import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { RolesUser } from '../../guards/role.guard';
import { UpdateMasterDto } from './dto/update-master.dto';
import { UpdateMasterStatusDto } from './dto/update-master-status.dto';
import { MasterService } from './master.service';

@Controller('masters')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  // создание страницы мастера
  @Roles([RolesUser.admin, RolesUser.user, RolesUser.master])
  @ApiCreatedResponse({ description: 'Wizard page created' })
  @ApiOperation({ summary: 'Создание страницы мастера' })
  @Post('me')
  async createWizardPage(@User('id') id: string) {
    return await this.masterService.createWizardPage(id);
  }

  // поиск по городу и рейтингу, В БУДУЩЕМ ДОБАВИТЬ КАТЕГОРИИ!!!city=&category=&rating=
  @Public()
  @ApiCreatedResponse({ description: 'Wizard page created' })
  @ApiOperation({ summary: 'Поиск мастера по городу' })
  @Get('')
  async getAvailableWizards(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('city') city?: string,
    @Query('rating') rating?: number,
  ) {
    return await this.masterService.getAvailableWizards(page, limit, city, rating);
  }

  // ТОЗ мастера города
  @Public()
  @ApiCreatedResponse({ description: 'Wizard page created' })
  @ApiOperation({ summary: 'Поиск топ мастеров города' })
  @Get('top')
  async getTopMasters(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('city') city?: string,
    @Query('rating') rating: number = 4,
  ) {
    return await this.masterService.getTopMasters(page, limit, city, rating);
  }

  // Профиль мастера
  @Public()
  @ApiCreatedResponse({ description: "The master's profile has been loaded." })
  @ApiOperation({ summary: 'Страница мастера по ID' })
  @Get(':id')
  async getByIdMaster(@Param('id') id: string) {
    return await this.masterService.getByIdMaster(id);
  }

  // Обновить профиль мастера
  @Roles([RolesUser.master])
  @ApiCreatedResponse({ description: "The master's profile has been loaded." })
  @ApiOperation({ summary: 'Страница мастера по ID' })
  @Patch(':id')
  async updateMasterProfile(@User('id') userId: string, @Param('id') id: string, @Body() body: UpdateMasterDto) {
    return await this.masterService.updateMasterProfile(userId, id, body);
  }

  // Обновить профиль мастера
  @Roles([RolesUser.master])
  @ApiCreatedResponse({ description: "The master's profile has been loaded." })
  @ApiOperation({ summary: 'Страница мастера по ID' })
  @Patch(':id/avatar')
  async uploadAvatar(@Param('id') id: string, @User('id') userId: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }
    return await this.masterService.uploadAvatar(id, userId, file);
  }

  // статистика выводим количество оценок и средний рейтинг, В БУДУЩЕМ СДЕЛАТЬ ЗАПИСИ И ФИНАНСЫ
  @Roles([RolesUser.master])
  @ApiCreatedResponse({ description: 'Master statistics' })
  @ApiOperation({ summary: 'Статистика мастера' })
  @Get(':id/stats')
  async getMasterStats(@Param('id') id: string, @User('id') userId: string) {
    return await this.masterService.getMasterStats(id, userId);
  }

  // изменить статус мастера
  @Roles([RolesUser.master])
  @ApiCreatedResponse({ description: 'Master status changed' })
  @ApiOperation({ summary: 'изменение статуса мастера' })
  @Patch(':id/status')
  async updateMasterStatus(@Param('id') id: string, @User('id') userId: string, @Body() body: UpdateMasterStatusDto) {
    return await this.masterService.updateMasterStatus(id, userId, body);
  }
}
