import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ServicesEntity } from './services.entity';

@Table({ tableName: 'categories' })
export class CategoryEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public slug: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare public iconUrl: string;

  @ForeignKey(() => CategoryEntity)
  @Column({ type: DataType.UUID, allowNull: true })
  declare public parentId: string | null;

  // Родительская категория
  @BelongsTo(() => CategoryEntity, { foreignKey: 'parentId', as: 'parent' })
  public parent: CategoryEntity;

  // Дочерние категории
  @HasMany(() => CategoryEntity, { foreignKey: 'parentId', as: 'children' })
  public children: CategoryEntity[];

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare public sortOrder: number;

  @HasMany(() => ServicesEntity, { foreignKey: 'categoryId', as: 'services' })
  public services: ServicesEntity[];
}
