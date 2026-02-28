import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { BookingEntity } from './bookings.entity';
import { MasterProfileEntity } from './master-profile.entity';
import { UserEntity } from './user.entity';

// отзывы
@Table({ tableName: 'reviews' })
export class ReviewsEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => BookingEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare bookingId: string;

  @BelongsTo(() => BookingEntity, { foreignKey: 'bookingId', as: 'booking' })
  public booking: BookingEntity;

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

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  declare public rating: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Текст отзыва — необязателен, клиент может поставить только звёзды',
  })
  declare public text: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Публичный ответ мастера — повышает вовлечённость и доверие новых клиентов',
  })
  declare public masterReply: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: 'false = скрыт модератором за спам или нарушение правил — без удаления',
  })
  declare public isPublished: boolean;
}
