import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TypeCommission } from '../../../common/enum';
import { Zone } from '../zone';
import { Product } from '../product';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true, length: 45 })
  name: string;
  @Column({ nullable: true, length: 45 })
  description: string;
  @Column({ type: 'int' })
  percentage: number;
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minimum_amount: number;
  @Column({ type: 'enum', enum: TypeCommission })
  type: TypeCommission;
  @OneToMany(() => Zone, (zone) => zone.commission_id)
  zone: Zone[];
  @OneToMany(() => Product, (product) => product.commission_id)
  product: Product[];
}
