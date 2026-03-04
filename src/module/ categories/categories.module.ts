import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { CategoryEntity } from '../../database/entities';
import { FilesService } from '../../upload/files.service';
import { MinioModule } from '../minio/minio.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [RedisModule, MinioModule, SequelizeModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService, FilesService],
  exports: [CategoriesService, SequelizeModule],
})
export class CategoriesModule {}
