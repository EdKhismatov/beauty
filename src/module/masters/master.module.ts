import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MasterProfileEntity } from '../../database/entities';
import { FilesService } from '../../upload/files.service';
import { CitiesModule } from '../cities/cities.module';
import { MinioModule } from '../minio/minio.module';
import { UserModule } from '../users/user.module';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';

@Module({
  imports: [UserModule, MinioModule, CitiesModule, SequelizeModule.forFeature([MasterProfileEntity])],
  controllers: [MasterController],
  providers: [MasterService, FilesService],
  exports: [MasterService, SequelizeModule],
})
export class MasterModule {}
