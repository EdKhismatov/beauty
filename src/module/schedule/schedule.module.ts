import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MasterProfileEntity, ScheduleEntity } from '../../database/entities';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [SequelizeModule.forFeature([ScheduleEntity, MasterProfileEntity])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService, SequelizeModule],
})
export class ScheduleModule {}
