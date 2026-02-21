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
import { cacheMyPortfolio } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FilesService } from '../../upload/files.service';
import { CreatePortfolioDto, IdDto, IdPortfolioDto } from './dto';

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
    const key = cacheMyPortfolio(user.id);
    await this.redisService.delete(key);
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

    const cacheKey = cacheMyPortfolio(user.id);
    await this.redisService.delete(cacheKey);

    this.logger.log(`Фото ${fileName} успешно удалено`);
    return { success: true };
  }

  // удаление портфолио
  async removePortfolio(id: IdPortfolioDto, user: UserEntity) {
    const transaction = await this.sequelize.transaction();
    try {
      const portfolio = await this.portfolioEntity.findByPk(id.id, { transaction });
      if (!portfolio) {
        throw new NotFoundException(`Портфолио не найдено`);
      }
      if (portfolio.userId !== user.id) {
        throw new ForbiddenException('У вас нет прав для удаления этого портфолио');
      }
      const filesToDelete = [...portfolio.imageUrl];
      await portfolio.destroy({ transaction });

      await transaction.commit();
      await Promise.all(filesToDelete.map((el) => this.filesService.removeImage(el)));

      const cacheKey = cacheMyPortfolio(user.id);
      await this.redisService.delete(cacheKey);

      return { success: true };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof HttpException) throw error;
      this.logger.error(`Ошибка при удалении портфолио: ${error.message}`);
      throw new InternalServerErrorException('Не удалось удалить портфолио');
    }
  }
}
