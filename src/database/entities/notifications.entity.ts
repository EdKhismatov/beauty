import { BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserEntity } from './user.entity';

// уведомления
@Table({ tableName: 'notifications' })
export class NotificationsEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['booking_confirmed', 'booking_reminder', 'new_review', 'promo']],
    },
  })
  declare public type: string;

  @Column({
    type: DataType.STRING(200), // Соответствует VARCHAR(200)
    allowNull: false,
    comment: 'Заголовок push-уведомления (отображается в шторке смартфона)',
  })
  declare public title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Полный текст уведомления с деталями (мастер, время, адрес)',
  })
  declare public body: string;

  @Column({ type: DataType.UUID, allowNull: true, comment: 'ID связанного объекта для глубокой ссылки (Deep Link)' })
  declare public refId: string | null;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    comment: 'Статус прочтения: false — новое, true — прочитано',
  })
  declare public isRead: boolean;
}
