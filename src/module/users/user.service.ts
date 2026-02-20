import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from '../../database/entities/user.entity';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity)
    private userModel: typeof UserEntity,
  ) {}

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async register(dto: UserCreateDto): Promise<UserEntity> {
    return this.userModel.create({ ...dto });
  }

  async getById(id: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { id } });
  }

  async findByToken(verificationToken: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { verificationToken } });
  }
}
