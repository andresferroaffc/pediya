import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user';
import { ProductReferral } from '../product-referral';
import { PaymentMethod } from '../payment-method';
import { StatusReferralEnum } from '../../../common/enum/status_referral';
import { Zone } from '../zone';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false, unique: true, length: 45 })
  consecutive: string;
  @Column({ type: 'timestamp' })
  date_of_elaboration: Date;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  payment_method_value: number;
  @Column({ type: 'varchar', nullable: true })
  description: string;
  @Column({ type: 'enum', enum: StatusReferralEnum })
  status: StatusReferralEnum;
  @ManyToOne(() => User, (user) => user.referral)
  @JoinColumn({ name: 'seller_id' })
  seller_id: User;
  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.referral)
  @JoinColumn({ name: 'payment_methods_id' })
  payment_methods_id: PaymentMethod;
  @ManyToOne(() => User, (user) => user.referral2)
  @JoinColumn({ name: 'user_id' })
  user_id: User;
  @ManyToOne(() => Zone, (zone) => zone.referral)
  @JoinColumn({ name: 'zone_id' })
  zone_id: Zone;
  @OneToMany(
    () => ProductReferral,
    (productReferral) => {
      productReferral.referral;
    },
  )
  productReferral: ProductReferral[];
}
