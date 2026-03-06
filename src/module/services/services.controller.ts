import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { RolesUser } from '../../guards/role.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // услуги конкретного мастера
  @Public()
  @ApiResponse({ description: 'Master services' })
  @ApiOperation({ summary: 'Услуги мастера' })
  @Get('masters/:masterId')
  async getMasterServices(@Param('masterId') masterId: string) {
    return await this.servicesService.getMasterServices(masterId);
  }

  // определенная услуга
  @Public()
  @ApiResponse({ description: 'a certain service is provided' })
  @ApiOperation({ summary: 'Определенная услуга' })
  @Get(':id')
  async getServiceByID(@Param('id') id: string) {
    return await this.servicesService.getServiceByID(id);
  }

  // создание услуги
  @Roles([RolesUser.master])
  @ApiResponse({ description: 'Service creation' })
  @ApiOperation({ summary: 'Создание услуги' })
  @Post('')
  async createService(@Body() body: CreateServiceDto, @User('id') id: string) {
    return await this.servicesService.createService(body, id);
  }

  // редактирование услуги
  @Roles([RolesUser.master])
  @ApiResponse({ description: 'editing services' })
  @ApiOperation({ summary: 'Редактирование услуги' })
  @Patch(':id')
  async updateService(@Param('id') id: string, @Body() body: UpdateServiceDto, @User('id') userId: string) {
    return await this.servicesService.updateService(id, body, userId);
  }

  //  вкл/выкл услуги
  @Roles([RolesUser.master])
  @ApiResponse({ description: 'editing services' })
  @ApiOperation({ summary: 'вкл/выкл услуги' })
  @Patch(':id/toggle')
  async toggleBlockService(@Param('id') id: string, @User('id') userId: string) {
    return await this.servicesService.toggleBlockService(id, userId);
  }

  //  Удаление услуги
  @Roles([RolesUser.master])
  @ApiResponse({ description: 'Delete service' })
  @ApiOperation({ summary: 'Удаление услуги' })
  @Delete(':id')
  async deleteService(@Param('id') id: string, @User('id') userId: string) {
    return await this.servicesService.deleteService(id, userId);
  }
}
