import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserEntity } from './user.entity';

// время работы
@Table({ tableName: 'schedules' })
export class ScheduleEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID })
  declare userId: string;

  @BelongsTo(() => UserEntity)
  master: UserEntity;

  @Column({ type: DataType.INTEGER })
  declare dayOfWeek: number; // 0 (Вс) - 6 (Сб)

  @Column({ type: DataType.TIME })
  declare startTime: string; // "09:00"

  @Column({ type: DataType.TIME })
  declare endTime: string; // "18:00"

  @Column({ defaultValue: true })
  declare isActive: boolean; // Можно ли записаться в этот день
}
