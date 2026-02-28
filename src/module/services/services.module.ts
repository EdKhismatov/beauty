import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { PortfolioEntity, ScheduleEntity, ServicesEntity, UserEntity } from '../../database/entities';
import { AuthModule } from '../auth/auth.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity, PortfolioEntity, ServicesEntity, ScheduleEntity]),
    AuthModule,
    RedisModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
