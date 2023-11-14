import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Referral } from '../referral';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false, unique: true, length: 45 })
  name: string;
  @Column({ type: 'boolean', default: true })
  status: boolean;
  @OneToMany(() => Referral, (referral) => referral.payment_methods_id)
  referral: Referral[];
}
