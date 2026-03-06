import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CategoryEntity, MasterProfileEntity, ServicesEntity } from '../../database/entities';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectModel(ServicesEntity)
    private servicesModel: typeof ServicesEntity,

    @InjectModel(MasterProfileEntity)
    private masterModel: typeof MasterProfileEntity,
  ) {}

  // услуги конкретного мастера
  async getMasterServices(masterId: string) {
    const services = await this.servicesModel.findAll({ where: { masterId, isActive: true } });
    this.logger.log(`Услуги мастера с ID${masterId} подгружены`);
    return services;
  }

  // конкретная услуга
  async getServiceByID(id: string) {
    const service = await this.servicesModel.findByPk(id, {
      include: [
        { model: MasterProfileEntity, as: 'master', attributes: ['id', 'experienceYears', 'ratingAvg'] },
        { model: CategoryEntity, as: 'category', attributes: ['id', 'name', 'parentId'] },
      ],
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    this.logger.log(`Услуга по ID${id} подгружена`);
    return service;
  }

  // создание услуги
  async createService(body: CreateServiceDto, id: string) {
    const master = await this.masterModel.findOne({ where: { userId: id } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const service = await this.servicesModel.create({ ...body, masterId: master.id });
    this.logger.log(`Услуга создана мастером ${master.id}`);
    return service;
  }

  // редактирование услуги
  async updateService(id: string, body: UpdateServiceDto, userId: string) {
    const master = await this.masterModel.findOne({ where: { userId } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const service = await this.servicesModel.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.masterId !== master.id) {
      throw new ForbiddenException('Вы не можете редактировать чужой профиль');
    }
    await service.update({ ...body });
    this.logger.log(`Услуга обновлена с ID ${id}`);
    return service;
  }

  // вкл/выкл услуги
  async toggleBlockService(id: string, userId: string) {
    const master = await this.masterModel.findOne({ where: { userId } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const service = await this.servicesModel.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.masterId !== master.id) {
      throw new ForbiddenException('Вы не можете редактировать чужую услугу');
    }
    await service.update({ isActive: !service.isActive });
    this.logger.log(`Услуга ${service.name} ${service.isActive ? 'активирована' : 'деактивирована'}`);
    return service;
  }

  // удаление услуги
  async deleteService(id: string, userId: string) {
    const master = await this.masterModel.findOne({ where: { userId } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const service = await this.servicesModel.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.masterId !== master.id) {
      throw new ForbiddenException('Вы не можете удалять чужую услугу');
    }
    await service.destroy();
    this.logger.log(`Услуга c ID${id} успешно удалена`);
    return { message: 'Услуга удалена' };
  }
}
