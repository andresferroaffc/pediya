import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Zone } from '../zone';
import { Product } from '../product';
import { TypeDiscount } from '../../../common/enum';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type:'varchar',nullable: false,  length: 60 })
  name: string;
  @Column({ type:'varchar',nullable: true, length: 200 })
  description: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 })
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
