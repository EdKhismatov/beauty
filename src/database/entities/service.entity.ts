import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserEntity } from './user.entity';

@Table({ tableName: 'services' })
export class ServiceEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ allowNull: false })
  declare name: string; // "Маникюр + покрытие"

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare duration: number; // Длительность в минутах (например, 60, 90, 120)

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID })
  declare userId: string; // ID мастера, который оказывает услугу

  @BelongsTo(() => UserEntity)
  declare master: UserEntity;
}
