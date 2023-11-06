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

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  consecutive: number;
  @Column({ nullable: false, unique: true })
  identificaction_tercero: string;
  @Column({ default: true })
  date_of_elaboration: boolean;
  @Column({ default: 0 })
  quantity: number;
  @Column({ default: 0 })
  unit_value: number;
  @Column({ type: 'decimal', precision: 20, scale: 2 })
  payment_method_value: number;
  @ManyToOne(() => User, (user) => user.referral)
  @JoinColumn({ name: 'seller_id' })
  seller_id: User;
  @OneToMany(
    () => ProductReferral,
    (productReferral) => {
      productReferral.referral;
    },
  )
  productReferral: ProductReferral[];
}
