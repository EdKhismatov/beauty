import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MasterProfileEntity, ScheduleEntity } from '../../database/entities';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(MasterProfileEntity)
    private masterModel: typeof MasterProfileEntity,
    @InjectModel(ScheduleEntity)
    private scheduleModel: typeof ScheduleEntity,
  ) {}

  // расписание мастера
  async getMasterSchedule(masterId: string) {
    const schedule = await this.scheduleModel.findAll({ where: { masterId, isActive: true } });
    this.logger.log(`Расписание мастера с ID${masterId} подгружены`);
    return schedule;
  }

  // расписание на конкретный день мастера
  async getMasterScheduleDay(masterId: string, day: number) {
    const schedule = await this.scheduleModel.findAll({ where: { masterId, isActive: true, dayOfWeek: day } });
    this.logger.log(`Расписание мастера с ID${masterId} на конкретный день недели`);
    return schedule;
  }

  // создать день в расписании мастера
  async createScheduleDay(body: CreateScheduleDto, id: string) {
    const master = await this.masterModel.findOne({ where: { userId: id } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const day = await this.scheduleModel.findOne({ where: { masterId: master.id, dayOfWeek: body.dayOfWeek } });
    if (day) {
      throw new ConflictException('На этот день уже создано расписание');
    }
    const newDay = await this.scheduleModel.create({ ...body, masterId: master.id });
    this.logger.log(`Расписание мастера с ID${id} на конкретный день создано`);
    return newDay;
  }

  // обновить день в расписании
  async updateScheduleDay(body: UpdateScheduleDto, userId: string, id: string) {
    const master = await this.masterModel.findOne({ where: { userId } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const day = await this.scheduleModel.findOne({ where: { id } });
    if (!day) {
      throw new NotFoundException('Schedule not found');
    }
    if (day.masterId !== master.id) {
      throw new ForbiddenException('Вы не можете редактировать чужое расписание');
    }
    await day.update(body);
    this.logger.log(`Расписание мастера с ID${id} на конкретный день обновлено`);
    return day;
  }

  // удалить день в расписании
  async deleteScheduleDay(userId: string, id: string) {
    const master = await this.masterModel.findOne({ where: { userId } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    const day = await this.scheduleModel.findOne({ where: { id } });
    if (!day) {
      throw new NotFoundException('Schedule not found');
    }
    if (day.masterId !== master.id) {
      throw new ForbiddenException('Вы не можете удалить чужое расписание');
    }
    await day.destroy();
    this.logger.log(`Расписание мастера с ID${id} на конкретный день удалено`);
    return { message: 'Расписание удалено' };
  }
}
