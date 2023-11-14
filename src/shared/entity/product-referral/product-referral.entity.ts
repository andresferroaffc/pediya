import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../product';
import { Referral } from '../referral';

@Entity('products_x_referrals')
export class ProductReferral {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false, unique: true, length: 45 })
  consecutive: string;
  @Column({ type: 'int' })
  quantity: number;
  @Column({ type: 'decimal', precision: 20, scale: 2 })
  unit_value: number;
  @ManyToOne(
    () => Referral,
    (referral) => {
      referral.productReferral;
    },
  )
  @JoinColumn({
    name: 'referral_id',
  })
  referral: Referral[];
  @ManyToOne(
    () => Product,
    (product) => {
      product.productReferral;
    },
  )
  @JoinColumn({
    name: 'product_id',
  })
  product: Product[];
}
