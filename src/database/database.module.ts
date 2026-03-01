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

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        ...appConfig.postgres,
        autoLoadModels: true,
        synchronize: true,
        logging: false,
        // sync: { alter: true },
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
        ],
      }),
    }),
  ],
})
export class DatabaseModule {}
