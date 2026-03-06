import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { RolesUser } from '../../guards/role.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Дерево категорий (с дочерними)
  @Public()
  @ApiResponse({ description: 'Category tree (with children)' })
  @ApiOperation({ summary: 'Дерево категорий (с дочерними)' })
  @Get('')
  async getCategories() {
    return await this.categoriesService.getCategories();
  }

  // Одна категория по ID
  @Public()
  @ApiResponse({ description: 'Category by ID' })
  @ApiOperation({ summary: 'Категория по ID' })
  @Get(':id')
  async getCategoriesById(@Param('id') id: string) {
    return await this.categoriesService.getCategoriesById(id);
  }

  // Категория по slug — для SEO-роутов
  @Public()
  @ApiResponse({ description: 'Category by slug - for SEO routes' })
  @ApiOperation({ summary: 'Категория по slug — для SEO-роутов' })
  @Get('slug/:slug')
  async getCategoriesSlug(@Param('slug') slug: string) {
    return await this.categoriesService.getCategoriesSlug(slug);
  }

  // создание категории
  @Roles([RolesUser.admin])
  @ApiResponse({ description: 'Category created' })
  @ApiOperation({ summary: 'Создание категории' })
  @Post('')
  async createCategories(@Body() body: CreateCategoriesDto) {
    return await this.categoriesService.createCategories(body);
  }

  // Обновить категорию
  @Roles([RolesUser.admin])
  @ApiResponse({ description: 'Category updated' })
  @ApiOperation({ summary: 'Обновить категорию' })
  @Patch(':id')
  async updateCategories(@Body() body: UpdateCategoriesDto, @Param('id') id: string) {
    return await this.categoriesService.updateCategories(body, id);
  }

  // Удалить категорию
  @Roles([RolesUser.admin])
  @ApiResponse({ description: 'Category removed' })
  @ApiOperation({ summary: 'Удаление категории' })
  @Delete(':id')
  async deleteCategories(@Param('id') id: string) {
    return await this.categoriesService.deleteCategories(id);
  }

  // Иконка категории
  @Roles([RolesUser.admin])
  @ApiResponse({ description: 'icon loaded' })
  @ApiOperation({ summary: 'Иконка категории' })
  @Patch(':id/icon')
  async createIconCategories(@Param('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }
    return await this.categoriesService.createIconCategories(id, file);
  }
}
