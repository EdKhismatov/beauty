import { MultipartFile } from '@fastify/multipart';
import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CacheTime } from '../../cache/cache.constants';
import { cacheAllCategories, cacheCategoryId, cacheCategorySlug } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { CategoryEntity } from '../../database/entities';
import { FilesService } from '../../upload/files.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(CategoryEntity)
    private categoryModel: typeof CategoryEntity,

    private readonly redisService: RedisService,

    @Inject(FilesService)
    private filesService: FilesService,
  ) {}

  // Дерево категорий (с дочерними)
  async getCategories() {
    const key = cacheAllCategories();
    const cached = await this.redisService.get(key);
    if (cached) return cached;

    const category = await this.categoryModel.findAll({
      where: { parentId: null },
      include: [{ model: CategoryEntity, as: 'children' }],
      order: [['sortOrder', 'ASC']],
    });

    if (category.length === 0) {
      throw new NotFoundException('No categories found');
    }

    await this.redisService.set(key, category, { EX: CacheTime.min30 });
    this.logger.log(`Категории подгружены`);
    return category;
  }

  async getCategoriesById(id: string) {
    const key = cacheCategoryId(id);
    const cached = await this.redisService.get(key);
    if (cached) return cached;

    const category = await this.categoryModel.findByPk(id, {
      include: [{ model: CategoryEntity, as: 'children' }],
    });

    if (!category) {
      throw new NotFoundException('No categories found');
    }

    await this.redisService.set(key, category, { EX: CacheTime.min30 });
    this.logger.log(`Категория подгружена`);
    return category;
  }

  //  Категория по slug — для SEO-роутов
  async getCategoriesSlug(slug: string) {
    const key = cacheCategorySlug(slug);
    const cached = await this.redisService.get(key);
    if (cached) return cached;

    const category = await this.categoryModel.findOne({
      where: { slug },
      include: [{ model: CategoryEntity, as: 'children' }],
    });

    if (!category) {
      throw new NotFoundException('No categories found');
    }

    await this.redisService.set(key, category, { EX: CacheTime.min30 });
    this.logger.log(`Категория подгружена`);
    return category;
  }

  //  Создание категории
  async createCategories(body: CreateCategoriesDto) {
    const category = await this.categoryModel.findOne({
      where: { name: body.name },
    });

    if (category) {
      throw new ConflictException('Category already exists');
    }

    const newCategory = await this.categoryModel.create({ ...body });
    await this.redisService.delete(cacheAllCategories());
    this.logger.log(`Категория создана`);
    return newCategory;
  }

  //  Обновить категорию
  async updateCategories(body: UpdateCategoriesDto, id: string) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException('Сategory not found');
    }

    await category.update({ ...body });
    await Promise.all([
      this.redisService.delete(cacheAllCategories()),
      this.redisService.delete(cacheCategoryId(id)),
      this.redisService.delete(cacheCategorySlug(category.slug)),
    ]);
    this.logger.log(`Категория обновлена`);
    return category;
  }

  //  Удаление категории
  async deleteCategories(id: string) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException('Сategory not found');
    }

    const children = await this.categoryModel.count({ where: { parentId: id } });
    if (children > 0) {
      throw new ConflictException('Нельзя удалить категорию с дочерними категориями');
    }

    await category.destroy();
    await Promise.all([
      this.redisService.delete(cacheAllCategories()),
      this.redisService.delete(cacheCategoryId(id)),
      this.redisService.delete(cacheCategorySlug(category.slug)),
    ]);
    this.logger.log(`Категория удалена`);
    return { success: true };
  }

  //  иконка для категории
  async createIconCategories(id: string, file: MultipartFile) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException('Сategory not found');
    }

    if (category.iconUrl) {
      await this.filesService.removeImage(category.iconUrl);
    }

    const fileName = await this.filesService.createFile(file);
    await category.update({ iconUrl: fileName });

    return { success: true };
  }
}
