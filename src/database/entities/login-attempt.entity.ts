import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'login-attempt' })
export class LoginAttemptEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare public id: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare public timestamp: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public email: string;

  @Column({ type: DataType.STRING(45), allowNull: false })
  declare public ip: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare public success: boolean;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public loginResult: string;
}
