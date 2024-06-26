import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product';

@Entity('inventory_groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true, length: 80 })
  name: string;
  @Column({ nullable: true, length: 150 })
  description: string;
  @Column({ type: 'boolean', nullable: true, default:true })
  status: boolean;
  @OneToMany(() => Product, (product) => product.inventory_group_id)
  product: Product[];
}
