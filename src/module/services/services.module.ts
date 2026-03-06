import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MasterProfileEntity, ServicesEntity } from '../../database/entities';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [SequelizeModule.forFeature([ServicesEntity, MasterProfileEntity])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService, SequelizeModule],
})
export class ServicesModule {}
