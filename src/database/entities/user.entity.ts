import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { RolesUser } from '../../guards/role.guard';
import { BookingEntity } from './bookings.entity';
import { CitiesEntity } from './cities.entity';
import { FavoritesEntity } from './favorites.entity';
import { MasterProfileEntity } from './master-profile.entity';
import { NotificationsEntity } from './notifications.entity';
import { ReviewsEntity } from './reviews.entity';

@Table({ tableName: 'users', paranoid: true })
export class UserEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare public id: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  declare public email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public fullName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public password: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public avatarUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare public active: boolean;

  @Column({
    type: DataType.ENUM,
    values: [RolesUser.user, RolesUser.master],
    allowNull: false,
    defaultValue: RolesUser.user,
  })
  declare public role: RolesUser;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare public isVerified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare public verificationToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare public lastLoginAt: Date;

  // FK хранится в таблице users
  @ForeignKey(() => CitiesEntity)
  @Column({ type: DataType.UUID, allowNull: true })
  declare public cityId: string;

  // Пользователь принадлежит городу
  @BelongsTo(() => CitiesEntity, { foreignKey: 'cityId', as: 'city' })
  public city: CitiesEntity;

  @HasOne(() => MasterProfileEntity, { foreignKey: 'userId', as: 'masterProfile' })
  public masterProfile: MasterProfileEntity;

  @HasMany(() => BookingEntity, { foreignKey: 'clientId', as: 'bookings' })
  public bookings: BookingEntity[];

  @HasMany(() => ReviewsEntity, { foreignKey: 'clientId', as: 'reviews' })
  public reviews: ReviewsEntity[];

  @HasMany(() => FavoritesEntity, { foreignKey: 'userId', as: 'favorites' })
  public favorites: FavoritesEntity[];

  @HasMany(() => NotificationsEntity, { foreignKey: 'userId', as: 'notifications' })
  public notifications: NotificationsEntity[];
}
