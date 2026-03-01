import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { CitiesEntity } from '../../database/entities';
import { AuthModule } from '../auth/auth.module';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

@Module({
  imports: [RedisModule, AuthModule, SequelizeModule.forFeature([CitiesEntity])],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService, SequelizeModule],
})
export class CitiesModule {}
