import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesUser } from 'src/guards/role.guard';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { CitiesService } from './cities.service';
import { CreateCityDto, UpdateCityDto } from './dto';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  // получение всех активных городов
  @Public()
  @ApiResponse({ description: 'All active cities received' })
  @ApiOperation({ summary: 'Все активные города' })
  @Get('')
  async getCitiesAll() {
    return await this.citiesService.getCitiesAll();
  }

  // получение одного города по id
  @Public()
  @ApiResponse({ description: 'All active cities received' })
  @ApiOperation({ summary: 'Поиск города по ID' })
  @Get(':id')
  async getCityById(@Param('id') id: string) {
    return await this.citiesService.getCityById(id);
  }

  // получение одного города по slug
  @Public()
  @ApiResponse({ description: 'City by slug' })
  @ApiOperation({ summary: 'Поиск города по slug' })
  @Get('slug/:slug')
  async getCityBySlug(@Param('slug') slug: string) {
    return await this.citiesService.getCityBySlug(slug);
  }

  // получение одного города по id
  @Roles([RolesUser.admin])
  @ApiCreatedResponse({ description: 'A new city has been created' })
  @ApiOperation({ summary: 'Создание нового города' })
  @Post('')
  async createCity(@Body() body: CreateCityDto) {
    return await this.citiesService.createCity(body);
  }

  // изменение города
  @Roles([RolesUser.admin])
  @ApiCreatedResponse({ description: 'changed the city data' })
  @ApiOperation({ summary: 'Изменение города' })
  @Patch(':id')
  async updateCity(@Body() body: UpdateCityDto, @Param('id') id: string) {
    return await this.citiesService.updateCity(body, id);
  }

  // активация и деактивация города
  @Roles([RolesUser.admin])
  @ApiCreatedResponse({ description: 'activation/deactivation was successful' })
  @ApiOperation({ summary: 'активация/деактивация города' })
  @Patch(':id/toggle')
  async toggleCity(@Param('id') id: string) {
    return await this.citiesService.toggleCity(id);
  }
}
