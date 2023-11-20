import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Discount } from '../discount';
import { Commission } from '../commission';
import { Referral } from '../referral';

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false, unique: true, length: 50 })
  name: string;
  @Column({ type: 'varchar', length: 20 })
  departament_code: string;
  @Column({ type: 'varchar', length: 20 })
  city_code: string;
  @Column({ nullable: true, length: 150 })
  description: string;
  @ManyToOne(() => Discount, (discount) => discount.zone)
  @JoinColumn({ name: 'discount_id' })
  discount_id: Discount;
  @ManyToOne(() => Commission, (commission) => commission.zone)
  @JoinColumn({ name: 'commission_id' })
  commission_id: Commission;
  @OneToMany(() => Referral, (referral) => referral.zone_id)
  referral: Referral[];
}
