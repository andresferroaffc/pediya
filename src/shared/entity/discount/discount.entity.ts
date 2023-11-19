import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Zone } from '../zone';
import { Product } from '../product';
import { TypeDiscount } from '../../../common/enum';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type:'varchar',nullable: false, unique: true, length: 45 })
  name: string;
  @Column({ type:'varchar',nullable: true, length: 45 })
  description: string;
  @Column({ type: 'int' })
  percentage: number;
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minimum_amount: number;
  @Column({ type: 'enum', enum: TypeDiscount })
  type: TypeDiscount;
  @OneToMany(() => Zone, (zone) => zone.discount_id)
  zone: Zone[];
  @OneToMany(() => Product, (product) => product.discount_id)
  product: Product[];
}
