import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { StatusMaster } from '../../guards/role.guard';
import { BookingEntity } from './bookings.entity';
import { CitiesEntity } from './cities.entity';
import { FavoritesEntity } from './favorites.entity';
import { PortfolioEntity } from './portfolio.entity';
import { PromotionsEntity } from './promotions.entity';
import { ReviewsEntity } from './reviews.entity';
import { ScheduleEntity } from './schedule.entity';
import { ServicesEntity } from './services.entity';
import { UserEntity } from './user.entity';

@Table({ tableName: 'master_profiles' })
export class MasterProfileEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare public id: string;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID })
  declare userId: string;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;

  @ForeignKey(() => CitiesEntity)
  @Column({ type: DataType.UUID })
  declare public cityId: string;

  @BelongsTo(() => CitiesEntity)
  public city: CitiesEntity;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public bio: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare public experienceYears: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public address: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    comment: 'Широта центра города',
  })
  declare public lat: number | null;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    comment: 'Долгота центра города',
  })
  declare public lng: number | null;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  declare public ratingAvg: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare public ratingCount: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare public isTop: boolean;

  @Column({
    type: DataType.ENUM,
    values: [StatusMaster.banned, StatusMaster.paused, StatusMaster.active],
    allowNull: false,
    defaultValue: StatusMaster.active,
  })
  declare public status: StatusMaster;

  @HasMany(() => ServicesEntity, { foreignKey: 'masterId', as: 'services' })
  public service: ServicesEntity[];

  @HasMany(() => ScheduleEntity, { foreignKey: 'masterId', as: 'schedule' })
  public schedule: ScheduleEntity[];

  @HasMany(() => BookingEntity, { foreignKey: 'masterId', as: 'bookings' })
  public bookings: BookingEntity[];

  @HasMany(() => ReviewsEntity, { foreignKey: 'masterId', as: 'reviews' })
  public reviews: ReviewsEntity[];

  @HasMany(() => PortfolioEntity, { foreignKey: 'masterId', as: 'portfolio' })
  public portfolio: PortfolioEntity[];

  @HasMany(() => FavoritesEntity, { foreignKey: 'masterId', as: 'favorites' })
  public favorites: FavoritesEntity[];

  @HasMany(() => PromotionsEntity, { foreignKey: 'masterId', as: 'promotions' })
  public promotions: PromotionsEntity[];
}
