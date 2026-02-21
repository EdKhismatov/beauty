import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  constructor(
    @InjectModel(PortfolioEntity)
    private portfolioEntity: typeof PortfolioEntity,
  ) {}

  async uploadWork(body: CreatePortfolioDto) {
    const product = await this.portfolioEntity.create({ ...body });
    this.logger.log(`Товар успешно создан`);
    return product;
  }
}
