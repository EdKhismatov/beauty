import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { appConfig } from '../config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        ...appConfig.postgres,
        autoLoadModels: true,
        synchronize: true,
        logging: false,
        sync: { alter: true },
      }),
    }),
  ],
})
export class DatabaseModule {}
