import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { CancelledBy, StatusBokings } from '../../guards/role.guard';
import { MasterProfileEntity } from './master-profile.entity';
import { ReviewsEntity } from './reviews.entity';
import { ServicesEntity } from './services.entity';
import { UserEntity } from './user.entity';

// записи
@Table({ tableName: 'bookings' })
export class BookingEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare clientId: string;

  @BelongsTo(() => UserEntity, { foreignKey: 'clientId', as: 'client' }) // ✅ as: 'client'
  public client: UserEntity;

  @ForeignKey(() => MasterProfileEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare masterId: string;

  @BelongsTo(() => MasterProfileEntity, { foreignKey: 'masterId', as: 'master' })
  public master: MasterProfileEntity;

  @ForeignKey(() => ServicesEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare serviceId: string;

  @BelongsTo(() => ServicesEntity, { foreignKey: 'serviceId', as: 'service' })
  public service: ServicesEntity;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Точное время начала визита',
  })
  declare public bookedAt: Date;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false, // ✅
    comment: 'Длительность в минутах',
  })
  declare public durationMin: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    comment: 'Зафиксированная цена на момент записи',
  })
  declare public price: number;

  @Column({
    type: DataType.ENUM,
    values: Object.values(StatusBokings), // ✅
    allowNull: false,
    defaultValue: StatusBokings.pending,
  })
  declare public status: StatusBokings;

  @Column({
    type: DataType.TEXT,
    allowNull: true, // ✅
    comment: 'Пожелания клиента',
  })
  declare public notes: string | null;

  @Column({
    type: DataType.ENUM,
    values: Object.values(CancelledBy),
    allowNull: true,
    comment: 'Кто отменил: client / master / admin',
  })
  declare public cancelledBy: CancelledBy | null;

  @HasOne(() => ReviewsEntity, { foreignKey: 'bookingId', as: 'review' })
  public review: ReviewsEntity;
}
