import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ServiceEntity } from '../../database/entities/service.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { RolesUser } from '../../guards/role.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { IdDto } from './dto/id.dto';
import { UpdateServicesDto } from './dto/update-services.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  constructor(
    @InjectModel(ServiceEntity)
    private serviceEntity: typeof ServiceEntity,

    private readonly sequelize: Sequelize,
  ) {}

  async createService(dto: CreateServiceDto, user: UserEntity) {
    try {
      const service = await this.serviceEntity.create({
        ...dto,
        userId: user.id, // Жестко привязываем услугу к создателю
      });

      this.logger.log(`Услуга "${service.name}" успешно создана мастером ${user.id}`);
      return service;
    } catch (error) {
      this.logger.error(`Ошибка при создании услуги: ${error.message}`);
      throw new InternalServerErrorException('Не удалось создать услугу');
    }
  }

  // Получить услуги для личного кабинета мастера (свои)
  async getMyServices(user: UserEntity) {
    const services = await this.serviceEntity.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    this.logger.log(`Мастер ${user.id} запросил свой прайс-лист`);
    return services;
  }

  // Получить услуги любого мастера по его ID (для клиентов)
  async getMasterServices(masterId: string) {
    const services = await this.serviceEntity.findAll({
      where: { userId: masterId },
      order: [['price', 'ASC']], // Для клиентов логично сортировать по цене (от дешевых)
      raw: true,
    });
    return services;
  }

  // удаление услуги
  async removeMasterServices(id: IdDto, user: UserEntity) {
    const transaction = await this.sequelize.transaction();
    try {
      const service = await this.serviceEntity.findByPk(id.id, { transaction });
      if (!service) {
        this.logger.error(`Услуга с id:${id.id} не найдена`);
        throw new NotFoundException(`Услуга не найдена`);
      }
      if (service.userId !== user.id && user.role !== RolesUser.admin) {
        this.logger.error(`Недостаточно прав для удаления данной услуги`);
        throw new ForbiddenException('У вас нет прав для удаления данной услуги');
      }
      await service.destroy({ transaction });

      await transaction.commit();

      this.logger.log(`Услуга с id:${id.id} успешно удалено`);
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof HttpException) throw error;
      this.logger.error(`Ошибка при удалении услуги: ${error.message}`);
      throw new InternalServerErrorException('Не удалось удалить портфолио');
    }
  }

  // редактирование услуги
  async updateMyServices(id: IdDto, dto: UpdateServicesDto, user: UserEntity) {
    const transaction = await this.sequelize.transaction();
    try {
      const service = await this.serviceEntity.findByPk(id.id, { transaction });
      if (!service) {
        this.logger.error(`Услуга с id:${id.id} не найдена`);
        throw new NotFoundException(`Услуга не найдена`);
      }
      if (service.userId !== user.id && user.role !== RolesUser.admin) {
        this.logger.error(`Недостаточно прав для редактирования данной услуги`);
        throw new ForbiddenException('У вас нет прав для редактирования данной услуги');
      }
      await service.update(dto, { transaction });
      this.logger.log(`Описание услуги успешно изменено`);

      await transaction.commit();

      this.logger.log(`Услуга с id:${id.id} успешно изменена`);
      return service;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof HttpException) throw error;
      this.logger.error(`Ошибка при редактировании услуги: ${error.message}`);
      throw new InternalServerErrorException('Не удалось редактировать услугу');
    }
  }
}
