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
  @Column({ type: 'varchar',nullable: false, unique: true, length:45 })
  consecutive: string;
  @Column({ type: 'timestamp' })
  date_of_elaboration:Date;
  @Column({ type: 'decimal', precision: 20, scale: 2 })
  payment_method_value: number;


  @Column({ nullable: false, unique: true })
  identificaction_tercero: string;
  @Column({ default: 0 })
  quantity: number;
  @Column({ default: 0 })
  unit_value: number;

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
