import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { MasterProfileEntity } from './master-profile.entity';
import { ServicesEntity } from './services.entity';

// портфолио мастера
@Table({ tableName: 'master_portfolio', paranoid: true })
export class PortfolioEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare public id: string;

  @ForeignKey(() => MasterProfileEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare masterId: string;

  @BelongsTo(() => MasterProfileEntity, { foreignKey: 'masterId', as: 'master' })
  public master: MasterProfileEntity;

  @ForeignKey(() => ServicesEntity)
  @Column({ type: DataType.UUID, allowNull: true })
  declare serviceId: string | null;

  @BelongsTo(() => ServicesEntity, { foreignKey: 'serviceId', as: 'service' })
  public service: ServicesEntity;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public imageUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Подпись к фото — мастер описывает технику, материалы, сложность работы',
  })
  declare public caption: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Счётчик лайков — кэшируется здесь, чтобы не делать COUNT() при каждом запросе',
  })
  declare public likesCount: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Обложка профиля — одно главное фото видно в карточке мастера в каталоге',
  })
  declare public isCover: boolean;
}
