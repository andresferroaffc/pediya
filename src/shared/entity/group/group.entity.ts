import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  name: string;
  @Column({ nullable: true})
  description: string;
  @Column({ nullable: false, })
  status: number;
  @OneToMany(() => Product, (product) => product.inventory_group)
  product: Product[];
}
