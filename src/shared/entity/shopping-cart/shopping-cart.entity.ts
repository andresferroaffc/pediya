import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../product';
import { User } from '../user';

@Entity('shopping-carts')
export class ShoppingCart {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'int', nullable: false })
  count: number;
  @ManyToOne(() => Product, (product) => product.shopping_cart_id)
  @JoinColumn({ name: 'product_id' })
  product_id: Product;
  @ManyToOne(() => User, (user) => user.shopping_cart_id)
  @JoinColumn({ name: 'user_id' })
  user_id: User;
  @ManyToOne(() => User, (user) => user.shopping_cart_id2)
  @JoinColumn({ name: 'seller_id' })
  seller_id: User;
}
