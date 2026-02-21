import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PortfolioEntity } from '../../database/entities/portfolio.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [SequelizeModule.forFeature([UserEntity, PortfolioEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, SequelizeModule],
})
export class UserModule {}
