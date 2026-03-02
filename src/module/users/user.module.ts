import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserEntity } from '../../database/entities/user.entity';
import { FilesService } from '../../upload/files.service';
import { CitiesModule } from '../cities/cities.module';
import { MinioModule } from '../minio/minio.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [CitiesModule, MinioModule, SequelizeModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, FilesService],
  exports: [UserService, SequelizeModule],
})
export class UserModule {}
