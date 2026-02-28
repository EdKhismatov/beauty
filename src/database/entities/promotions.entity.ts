import { BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { MasterProfileEntity } from './master-profile.entity';

// акции
@Table({ tableName: 'promotions' })
export class PromotionsEntity extends Model {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => MasterProfileEntity)
  @Column({ type: DataType.UUID })
  declare masterId: string;

  @BelongsTo(() => MasterProfileEntity, { foreignKey: 'masterId', as: 'master' })
  public master: MasterProfileEntity;

  @Column({
    type: DataType.STRING(200), // Соответствует VARCHAR(200)
    allowNull: false,
    comment: 'Название акции: «Скидка 20% на маникюр в июне», «Два по цене одного»',
  })
  declare public title: string;

  @Column({
    type: DataType.SMALLINT,
    allowNull: true,
    validate: {
      min: 1,
      max: 100,
    },
    comment: 'Процент скидки (1–100). Если NULL — условия только в тексте',
  })
  declare public discountPct: number | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: 'Дата начала действия: акция скрыта до этого дня (включительно)',
    defaultValue: DataType.NOW,
  })
  declare public validFrom: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: 'Дата окончания: после этого дня акция скрывается из каталога',
    validate: {
      isAfterValidFrom(value: string) {
        if (new Date(value) < new Date(this.valid_from)) {
          throw new Error('Дата окончания не может быть раньше даты начала');
        }
      },
    },
  })
  declare public validTo: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    comment: 'Ручное управление: мастер может деактивировать акцию в любой момент',
  })
  declare public isActive: boolean;
}
