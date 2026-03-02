import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { CitiesEntity } from '../../database/entities';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

@Module({
  imports: [RedisModule, SequelizeModule.forFeature([CitiesEntity])],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService, SequelizeModule],
})
export class CitiesModule {}
