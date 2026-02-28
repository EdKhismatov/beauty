// cities.entity.ts
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { MasterProfileEntity } from './master-profile.entity';
import { UserEntity } from './user.entity';

@Table({ tableName: 'cities' }) // paranoid убрали
export class CitiesEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare public id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare public name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare public slug: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public region: string;

  @Column({ type: DataType.CHAR(2), allowNull: false, defaultValue: 'RU' })
  declare public countryCode: string;

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

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare public isActive: boolean;

  // Один город — много пользователей
  @HasMany(() => UserEntity, { foreignKey: 'cityId', as: 'users' })
  public users: UserEntity[];

  @HasMany(() => MasterProfileEntity, { foreignKey: 'cityId', as: 'masters' })
  public masters: MasterProfileEntity[];
}
