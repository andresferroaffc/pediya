import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TypeCommission } from '../../../common/enum';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true, length: 45 })
  name: string;
  @Column({ nullable: true, length: 45 })
  description: string;
  @Column({ type: 'int' })
  percentage: number;
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minimum_amount: number;
  @Column({ type: 'boolean', default: false })
  is_general: boolean;
  @Column({ type: 'enum', enum: TypeCommission })
  type: TypeCommission;
}
