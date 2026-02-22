import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CacheTime } from '../../cache/cache.constants';
import { cacheGetAllProjects, cacheMyPortfolio } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FilesService } from '../../upload/files.service';
import { CreatePortfolioDto, IdDto, IdPortfolioDto } from './dto';
import { GetPortfolioQueryDto } from './dto/get-portfolio.query.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  constructor(
    @InjectModel(PortfolioEntity)
    private portfolioEntity: typeof PortfolioEntity,

    @InjectModel(UserEntity)
    private userEntity: typeof UserEntity,

    private readonly redisService: RedisService,

    private readonly filesService: FilesService,

    private readonly sequelize: Sequelize,
  ) {}

  async uploadWork(body: CreatePortfolioDto, user: UserEntity) {
    const product = await this.portfolioEntity.create({ ...body });
    this.logger.log(`Товар успешно создан`);

    await this.clearPortfolioCache(user.id);

    return product;
  }

  // товары продавца
  async getMyPortfolio(user: UserEntity) {
    const key = cacheMyPortfolio(user.id);
    const myPortfolio = await this.redisService.get(key);
    if (myPortfolio) {
      this.logger.log(`Достали из Redis портфолио которое принадлежит мастеру`);
      return myPortfolio;
    }

    const portfolio = await this.portfolioEntity.findAll({
      where: { userId: user.id },
      raw: true,
      nest: true,
    });

    await this.redisService.set(key, portfolio, { EX: CacheTime.min5 });
    this.logger.log(`Записали в Redis`);

    return portfolio;
  }

  // удаление фото
  async removePhoto(id: IdDto, user: UserEntity) {
    const fileName = id.id;
    const portfolioEntry = await this.portfolioEntity.findOne({
      where: {
        userId: user.id,
        imageUrl: { [Op.contains]: [fileName] }, // Sequelize-магия поиска в массиве
      },
    });
    if (!portfolioEntry) {
      throw new NotFoundException(`Фото не найдено в вашем портфолио`);
    }

    portfolioEntry.imageUrl = portfolioEntry.imageUrl.filter((name) => name !== fileName);

    await portfolioEntry.save();
    await this.filesService.removeImage(id.id);

    await this.clearPortfolioCache(user.id);

    this.logger.log(`Фото ${fileName} успешно удалено`);
    return { success: true };
  }

  // удаление портфолио
  async removePortfolio(id: IdPortfolioDto, user: UserEntity) {
    const transaction = await this.sequelize.transaction();
    try {
      const portfolio = await this.portfolioEntity.findByPk(id.id, { transaction });
      if (!portfolio) {
        this.logger.error(`Портфолио с id:${id.id} не найдено`);
        throw new NotFoundException(`Портфолио не найдено`);
      }
      if (portfolio.userId !== user.id) {
        this.logger.error(`Недостаточно прав для удаления данного портфолио`);
        throw new ForbiddenException('У вас нет прав для удаления этого портфолио');
      }
      const filesToDelete = [...portfolio.imageUrl];
      await portfolio.destroy({ transaction });

      await transaction.commit();
      await Promise.all(filesToDelete.map((el) => this.filesService.removeImage(el)));

      await this.clearPortfolioCache(user.id);

      this.logger.log(`Портфолио с id:${id.id} успешно удалено`);
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof HttpException) throw error;
      this.logger.error(`Ошибка при удалении портфолио: ${error.message}`);
      throw new InternalServerErrorException('Не удалось удалить портфолио');
    }
  }

  // выводим все портфолио
  async getAllProjects(query: GetPortfolioQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;

    const key = `${JSON.stringify(query)}`;
    const fullKey = cacheGetAllProjects(key);
    const cashPortfolio = await this.redisService.get(fullKey);

    if (cashPortfolio) {
      this.logger.log(`Достали из Redis`);
      return cashPortfolio;
    }

    const where: any = {};
    if (search) {
      where.description = { [Op.iLike]: `%${search}%` };
    }

    const { rows, count } = await this.portfolioEntity.findAndCountAll({
      where,
      limit,
      offset,
      raw: true,
      order: [['createdAt', 'DESC']],
    });

    const portfolioAll = {
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      portfolio: rows,
    };

    await this.redisService.set(fullKey, portfolioAll, { EX: CacheTime.min5 });
    this.logger.log(`Записали в Redis`);

    return portfolioAll;
  }

  // редактирование описания портфолио
  async updateMyPortfolio(idDto: IdDto, dto: UpdatePortfolioDto, user: UserEntity) {
    const product = await this.portfolioEntity.findByPk(idDto.id);
    if (!product) {
      throw new NotFoundException(`Портфолио с ID ${idDto.id} не найден`);
    }

    if (product.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(`У вас нет прав на редактирование этого товара`);
    }

    await product.update(dto);
    this.logger.log(`Описание портфолио успешно изменено`);

    await this.clearPortfolioCache(user.id);

    return product;
  }

  private async clearPortfolioCache(userId: string): Promise<void> {
    await Promise.all([
      this.redisService.delete(cacheMyPortfolio(userId)),
      this.redisService.deleteForPattern(cacheGetAllProjects() + '*'),
    ]);
    this.logger.log(`Кэш портфолио для пользователя ${userId} и общий список очищены`);
  }
}
