import { MultipartFile } from '@fastify/multipart';
import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CitiesEntity, MasterProfileEntity, UserEntity } from '../../database/entities';
import { RolesUser, StatusMaster } from '../../guards/role.guard';
import { FilesService } from '../../upload/files.service';
import { UserService } from '../users/user.service';
import { UpdateMasterDto } from './dto/update-master.dto';
import { UpdateMasterStatusDto } from './dto/update-master-status.dto';

@Injectable()
export class MasterService {
  private readonly logger = new Logger(MasterService.name);

  constructor(
    @InjectModel(MasterProfileEntity)
    private masterProfileModel: typeof MasterProfileEntity,
    private userService: UserService,

    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
  ) {}

  // Создание страницы мастера
  async createWizardPage(id: string) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.masterProfileModel.findOne({ where: { userId: id } });
    if (existing) {
      throw new ConflictException('Профиль мастера уже существует');
    }

    if (user.role === RolesUser.user) {
      await user.update({ role: RolesUser.master });
    }

    const master = await this.masterProfileModel.create({ userId: id });
    this.logger.log('Wizard page created');
    return master;
  }

  // Поиск матсеров по городу и рейтингу, В БУДУЩЕМ ДОБАВИТЬ КАТЕГОРИИ!!!
  async getAvailableWizards(page: number = 1, limit: number = 20, city?: string, rating?: number) {
    const offset = (page - 1) * limit;

    const where: any = { status: StatusMaster.active };

    if (city) {
      where.cityId = city;
    }

    if (rating) {
      where.ratingAvg = { [Op.gte]: rating }; // рейтинг >= указанного
    }

    const { rows, count } = await this.masterProfileModel.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: UserEntity, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        { model: CitiesEntity, as: 'city', attributes: ['id', 'name'] },
      ],
      order: [['ratingAvg', 'DESC']],
    });
    this.logger.log('masters successfully loaded');

    return {
      data: rows,
      total: count,
      page,
      lastPage: Math.ceil(count / limit),
    };
  }

  // Топ мастера города
  async getTopMasters(page: number = 1, limit: number = 20, city?: string, rating: number = 4) {
    const offset = (page - 1) * limit;

    const where: any = { status: StatusMaster.active, isTop: true };

    if (city) {
      where.cityId = city;
    }

    if (rating) {
      where.ratingAvg = { [Op.gte]: rating }; // рейтинг >= указанного
    }

    const { rows, count } = await this.masterProfileModel.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: UserEntity, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        { model: CitiesEntity, as: 'city', attributes: ['id', 'name'] },
      ],
      order: [['ratingAvg', 'DESC']],
    });
    this.logger.log('masters successfully loaded');

    return {
      data: rows,
      total: count,
      page,
      lastPage: Math.ceil(count / limit),
    };
  }

  // Страница мастера по ID
  async getByIdMaster(id: string) {
    const master = await this.masterProfileModel.findByPk(id, {
      include: [
        { model: UserEntity, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        { model: CitiesEntity, as: 'city', attributes: ['id', 'name'] },
      ],
    });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    return master;
  }

  // Обновить данные мастера
  async updateMasterProfile(userId: string, id: string, body: UpdateMasterDto) {
    const master = await this.masterProfileModel.findByPk(id);
    if (!master) {
      this.logger.log('Мастер не найден');
      throw new NotFoundException('Master not found');
    }

    if (master.userId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой профиль');
    }

    await master.update({ ...body });
    return master;
  }

  // загрузка автара
  async uploadAvatar(id: string, userId: string, file: MultipartFile) {
    const masterProfile = await this.masterProfileModel.findByPk(id);
    if (!masterProfile) {
      throw new NotFoundException('Master not found');
    }

    if (masterProfile.userId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой профиль');
    }

    if (masterProfile.avatarUrl) {
      await this.filesService.removeImage(masterProfile.avatarUrl);
    }

    const fileName = await this.filesService.createFile(file);
    await masterProfile.update({ avatarUrl: fileName });

    return { avatarUrl: fileName };
  }

  // статистика выводим количество оченок и средний рейтинг, В БУДУЩЕМ СДЕЛАТЬ ЗАПИСИ И ФИНАНСЫ
  async getMasterStats(id: string, userId: string) {
    const masterProfile = await this.masterProfileModel.findByPk(id);
    if (!masterProfile) {
      throw new NotFoundException('Master not found');
    }

    if (masterProfile.userId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой профиль');
    }

    return { rating: masterProfile.ratingAvg, ratingCount: masterProfile.ratingCount };
  }

  // изменение статуса мастера
  async updateMasterStatus(id: string, userId: string, body: UpdateMasterStatusDto) {
    const masterProfile = await this.masterProfileModel.findByPk(id);
    if (!masterProfile) {
      throw new NotFoundException('Master not found');
    }

    if (masterProfile.userId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой профиль');
    }
    await masterProfile.update({ status: body.status });
    return masterProfile;
  }
}
