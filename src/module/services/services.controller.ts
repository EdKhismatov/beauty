import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '../../database/entities/user.entity';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { AuthGuard } from '../../guards/jwt.guard';
import { RolesUser } from '../../guards/role.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { IdDto } from './dto/id.dto';
import { UpdateServicesDto } from './dto/update-services.dto';
import { ServicesService } from './services.service';

@ApiTags('v1/service')
@Controller('v1/service')
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiOperation({ summary: 'Создание новой услуги' })
  @ApiCreatedResponse({ description: 'Услуга успешно создана' })
  @Post('')
  async createService(@Body() dto: CreateServiceDto, @User() user: UserEntity) {
    return await this.servicesService.createService(dto, user);
  }

  // получить свои услуги
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiOperation({ summary: 'Получить свой прайс-лист (для мастера)' })
  @Get('my')
  async getMyServices(@User() user: UserEntity) {
    return await this.servicesService.getMyServices(user);
  }

  // посмотреть услуги конкретного мастера (для клиентов)
  @ApiOperation({ summary: 'Получить прайс-лист мастера по его ID' })
  @Get('master/:masterId')
  async getMasterServices(@Param('masterId') masterId: string) {
    return await this.servicesService.getMasterServices(masterId);
  }

  // удаление услуги
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiOperation({ summary: 'Удалить услугу по ID' })
  @Delete(':id')
  async removeMasterServices(@Param() id: IdDto, @User() user: UserEntity) {
    return await this.servicesService.removeMasterServices(id, user);
  }

  // редактирование своей услуги
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiCreatedResponse({ description: 'Editing services' })
  @ApiOperation({ summary: 'Редактирование услуги' })
  @Patch(':id')
  async updateMyServices(@Param() params: IdDto, @Body() dto: UpdateServicesDto, @User() user: UserEntity) {
    return await this.servicesService.updateMyServices(params, dto, user);
  }
}
