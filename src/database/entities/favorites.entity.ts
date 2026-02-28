import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { MasterProfileEntity } from './master-profile.entity';
import { UserEntity } from './user.entity';

// избранное
@Table({ tableName: 'favorites' })
export class FavoritesEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;

  @ForeignKey(() => MasterProfileEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare masterId: string;

  @BelongsTo(() => MasterProfileEntity, { foreignKey: 'masterId', as: 'master' })
  public master: MasterProfileEntity;
}
