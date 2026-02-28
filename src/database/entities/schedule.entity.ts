import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { MasterProfileEntity } from './master-profile.entity';

// время работы
@Table({ tableName: 'schedules' })
export class ScheduleEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => MasterProfileEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare masterId: string;

  @BelongsTo(() => MasterProfileEntity, { foreignKey: 'masterId', as: 'master' })
  public master: MasterProfileEntity;

  @Column({ type: DataType.SMALLINT, allowNull: false, comment: '0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс' })
  declare public dayOfWeek: number;

  @Column({ type: DataType.TIME, allowNull: false, comment: 'Начало рабочего дня' })
  declare public startTime: string;

  @Column({ type: DataType.TIME, allowNull: false, comment: 'Конец рабочего дня' })
  declare public endTime: string;

  @Column({ type: DataType.SMALLINT, allowNull: false, defaultValue: 30, comment: 'Шаг слотов в минутах' })
  declare public slotDuration: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true }) // ✅ true
  declare public isActive: boolean;
}
