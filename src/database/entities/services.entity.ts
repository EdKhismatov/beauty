import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { BookingEntity } from './bookings.entity';
import { CategoryEntity } from './category.entity';
import { MasterProfileEntity } from './master-profile.entity';
import { PortfolioEntity } from './portfolio.entity';

@Table({ tableName: 'services' })
export class ServicesEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => MasterProfileEntity)
  @Column({ type: DataType.UUID })
  declare masterId: string;

  @BelongsTo(() => MasterProfileEntity, { foreignKey: 'masterId', as: 'master' })
  public master: MasterProfileEntity;

  @ForeignKey(() => CategoryEntity)
  @Column({ type: DataType.UUID })
  declare categoryId: string;

  @BelongsTo(() => CategoryEntity, { foreignKey: 'categoryId', as: 'category' })
  public category: CategoryEntity;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare public description: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare public priceFrom: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare public priceTo: number;

  @Column({
    type: DataType.SMALLINT,
    allowNull: true,
    comment: 'Длительность услуги в минутах (может быть скорректирована мастером)',
    validate: {
      min: 1,
    },
  })
  declare public durationMin: number;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  declare public isActive: boolean;

  @HasMany(() => BookingEntity, { foreignKey: 'serviceId', as: 'bookings' })
  public bookings: BookingEntity[];

  @HasMany(() => PortfolioEntity, { foreignKey: 'serviceId', as: 'portfolio' })
  public portfolio: PortfolioEntity[];
}
