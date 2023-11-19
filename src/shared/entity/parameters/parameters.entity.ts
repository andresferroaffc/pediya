import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product';

@Entity('parameters')
export class Parameter {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true, length: 80 })
  name: string;
  @Column({ nullable: true, length: 150 })
  description: string;
  @Column({ type: 'boolean', nullable: true, default: false })
  status: boolean;
}
