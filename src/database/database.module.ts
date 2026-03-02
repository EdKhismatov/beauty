import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { appConfig } from '../config';
import {
  BookingEntity,
  CategoryEntity,
  CitiesEntity,
  FavoritesEntity,
  MasterProfileEntity,
  NotificationsEntity,
  PortfolioEntity,
  PromotionsEntity,
  ReviewsEntity,
  ScheduleEntity,
  ServicesEntity,
  UserEntity,
} from './entities';
import { LoginAttemptEntity } from './entities/login-attempt.entity';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        ...appConfig.postgres,
        autoLoadModels: true,
        synchronize: true,
        logging: false,
        // sync: { alter: true, force: true },
        models: [
          UserEntity,
          CitiesEntity,
          MasterProfileEntity,
          CategoryEntity,
          ServicesEntity,
          ScheduleEntity,
          BookingEntity,
          ReviewsEntity,
          PortfolioEntity,
          FavoritesEntity,
          NotificationsEntity,
          PromotionsEntity,
          LoginAttemptEntity,
        ],
      }),
    }),
  ],
})
export class DatabaseModule {}
