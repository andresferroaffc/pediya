import {
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
