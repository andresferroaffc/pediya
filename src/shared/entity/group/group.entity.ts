import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product';

@Entity('inventory_groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  name: string;
  @Column({ nullable: true })
  description: string;
  @Column({ nullable: false })
  status: boolean;
  @OneToMany(() => Product, (product) => product.inventory_group_id)
  product: Product[];
}
