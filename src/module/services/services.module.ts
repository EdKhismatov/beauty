import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { AppointmentEntity } from '../../database/entities/appointment.entity';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { ScheduleEntity } from '../../database/entities/schedule.entity';
import { ServiceEntity } from '../../database/entities/service.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity, PortfolioEntity, ServiceEntity, ScheduleEntity, AppointmentEntity]),
    AuthModule,
    RedisModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
