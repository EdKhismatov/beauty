import { MultipartFile } from '@fastify/multipart';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from '../../database/entities/user.entity';
import { FilesService } from '../../upload/files.service';
import { CitiesService } from '../cities/cities.service';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(UserEntity)
    private userModel: typeof UserEntity,

    @Inject(forwardRef(() => CitiesService))
    private readonly citiesService: CitiesService,

    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
  ) {}

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async register(dto: UserUpdateDto): Promise<UserEntity> {
    return this.userModel.create({ ...dto });
  }

  async getById(id: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { id } });
  }

  async findByToken(verificationToken: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { verificationToken } });
  }

  async updatePasswordByEmail(email: string, hashedPassword: string) {
    const [affectedCount] = await this.userModel.update({ password: hashedPassword }, { where: { email } });
    return affectedCount;
  }

  // изменение имени или города
  async updateUser(body: UserUpdateDto, id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (body.cityId) {
      await this.citiesService.getCityById(body.cityId);
    }

    await user.update({ ...body });
    this.logger.log(`Данные аккаунта обновлены`);
    const { password, ...result } = user.get({ plain: true });
    return result;
  }

  // удаление аккаунта
  async deleteUser(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      await user.destroy();
      this.logger.log(`Аккаунт успешно удален`);
    } catch (error) {
      this.logger.error('Ошибка при удалении аккаунта', error.message);
      throw new InternalServerErrorException('Ошибка при удалении аккаунта, попробуйте позже');
    }
    return true;
  }

  // получение всех пользователей
  async getAllUser(page: number = 1, limit: number = 20, active?: boolean) {
    const offset = (page - 1) * limit;

    const where = active !== undefined ? { active } : {};

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { exclude: ['password', 'verificationToken'] },
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      total: count,
      page,
      lastPage: Math.ceil(count / limit),
    };
  }

  // погрузка любого пользователя для админа
  async getUserById(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // загрузка автара
  async updateAvatar(id: string, file: MultipartFile) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarUrl) {
      await this.filesService.removeImage(user.avatarUrl);
    }

    const fileName = await this.filesService.createFile(file);
    await user.update({ avatarUrl: fileName });

    return { avatarUrl: fileName };
  }
}
