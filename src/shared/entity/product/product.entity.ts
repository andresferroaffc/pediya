import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../group';
import { ProductReferral } from '../product-referral';
import { TypeProduct } from '../../../common/enum';
import { Discount } from '../discount';
import { Commission } from '../commission';
import { ShoppingCart } from '../shopping-cart';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false, unique: true, length: 45 })
  code: string;
  @Column({ nullable: false, unique: true, length: 45 })
  name: string;
  @Column({ type: 'boolean', default: true })
  status: boolean;
  @Column({ type: 'int', default: 0, nullable: true })
  stock: number;
  @Column({ type: 'int', default: 0, nullable: true })
  min_tock: number;
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;
  @Column({ nullable: false })
  inventoried: boolean;
  @Column({ type: 'enum', enum: TypeProduct })
  type: TypeProduct;
  @Column({ nullable: true, length: 45 })
  description: string;
  @Column({ type: 'varchar', nullable: true, length: 200 })
  img: string;
  @ManyToOne(() => Group, (group) => group.product)
  @JoinColumn({ name: 'inventory_group_id' })
  inventory_group_id: Group;
  @ManyToOne(() => Discount, (discount) => discount.zone)
  @JoinColumn({ name: 'discount_id' })
  discount_id: Discount;
  @ManyToOne(() => Commission, (commission) => commission.zone)
  @JoinColumn({ name: 'commission_id' })
  commission_id: Commission;
  @OneToMany(
    () => ProductReferral,
    (productReferral) => {
      productReferral.product;
    },
  )
  productReferral: ProductReferral[];
  @OneToMany(
    () => ShoppingCart,
    (shoppingCart) => {
      shoppingCart.product_id;
    },
  )
  shopping_cart_id: ShoppingCart[];
}
