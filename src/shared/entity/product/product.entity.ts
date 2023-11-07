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
import { TypeProduct } from 'src/common/enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false, unique: true, length: 45 })
  code: string;
  @Column({ nullable: false, unique: true, length: 45 })
  name: string;
  @Column({ type: 'boolean',default: true })
  status: boolean;
  @Column({ type: 'int', default: 0 })
  stock: number;
  @Column({ type: 'int', default: 0 })
  min_tock: number;
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;
  @Column({ nullable: false })
  inventoried: boolean;
  @Column({ type: 'enum', enum: TypeProduct })
  type: TypeProduct;
  @ManyToOne(() => Group, (group) => group.product)
  @JoinColumn({ name: 'inventory_group_id' })
  inventory_group_id: Group;
  @OneToMany(
    () => ProductReferral,
    (productReferral) => {
      productReferral.product;
    },
  )
  productReferral: ProductReferral[];
}
