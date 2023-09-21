import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  code: string;
  @Column({ nullable: false, unique: true })
  name: string;
  @Column({ nullable: false })
  inventory_group: number;
  @Column({ default: true })
  status: boolean;
  @Column({ default: 0 })
  stock: number;
  @Column({ default: 0 })
  min_tock: number;
  @Column({ type: 'decimal', precision: 10, scale:2 })
  price: number;
  @Column({ nullable: false })
  inventoried: boolean;
}
