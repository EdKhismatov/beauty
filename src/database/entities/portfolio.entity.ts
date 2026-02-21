import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserEntity } from './user.entity';

@Table({ tableName: 'master_portfolio', paranoid: true })
export class PortfolioEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare public id: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare public imageUrl: string[]; // Путь к файлу в MinIO

  @Column({ type: DataType.STRING, allowNull: true })
  declare public description: string;

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare public userId: string;

  @BelongsTo(() => UserEntity)
  declare public master: UserEntity;
}
