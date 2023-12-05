import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypeCommissionHistory } from '../../../common/enum';
import { Referral } from '../referral';

@Entity('commissions_history')
export class CommissionHistory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'enum', enum: TypeCommissionHistory })
  status: TypeCommissionHistory;
  @Column({ nullable: true, length: 200 })
  description: string;
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
    default: 0,
  })
  amount: number;
  @ManyToOne(() => Referral, (referral) => referral.commissionHistory)
  @JoinColumn({ name: 'referral_id' })
  referral_id: Referral;
}
