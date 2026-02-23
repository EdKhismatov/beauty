import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ServiceEntity } from './service.entity';
import { UserEntity } from './user.entity';

export enum AppointmentStatus {
  PENDING = 'pending', // Ожидает подтверждения
  CONFIRMED = 'confirmed', // Подтверждено мастером
  CANCELLED = 'cancelled', // Отменено
  COMPLETED = 'completed', // Успешно завершено
}

@Table({ tableName: 'appointments' })
export class AppointmentEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID })
  declare masterId: string;

  @BelongsTo(() => UserEntity, 'masterId')
  master: UserEntity;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID })
  declare clientId: string;

  @BelongsTo(() => UserEntity, 'clientId')
  client: UserEntity;

  @BelongsTo(() => ServiceEntity)
  service: ServiceEntity;

  @ForeignKey(() => ServiceEntity)
  @Column({ type: DataType.UUID })
  declare serviceId: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare startTime: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare endTime: Date;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    defaultValue: AppointmentStatus.PENDING,
  })
  declare status: AppointmentStatus;

  @Column({ type: DataType.TEXT })
  declare comment: string;
}
