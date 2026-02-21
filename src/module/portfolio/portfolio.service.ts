import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CacheTime } from '../../cache/cache.constants';
import { cacheMyPortfolio } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  constructor(
    @InjectModel(PortfolioEntity)
    private portfolioEntity: typeof PortfolioEntity,

    @InjectModel(UserEntity)
    private userEntity: typeof UserEntity,

    private readonly redisService: RedisService,
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
}
