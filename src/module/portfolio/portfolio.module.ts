import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FilesModule } from '../../upload/files.module';
import { AuthModule } from '../auth/auth.module';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [SequelizeModule.forFeature([UserEntity, PortfolioEntity]), FilesModule, AuthModule, RedisModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService, SequelizeModule],
})
export class PortfolioModule {}
