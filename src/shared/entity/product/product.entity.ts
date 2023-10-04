import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../group';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  code: string;
  @Column({ nullable: false, unique: true })
  name: string;
  @Column({ default: true })
  status: boolean;
  @Column({ default: 0 })
  stock: number;
  @Column({ default: 0 })
  min_tock: number;
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;
  @Column({ nullable: false })
  inventoried: boolean;
  @ManyToOne(() => Group, (group) => group.product)
  inventory_group: Group;
}
