import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('parameters')
export class Parameter {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, type: 'boolean', default: false })
  seller_commission: boolean;
  @Column({ nullable: true, type: 'varchar', length: 100 })
  name_enterprise: string;
  @Column({ nullable: true, type: 'varchar', length: 200 })
  address: string;
  @Column({ nullable: true, type: 'varchar', length: 15 })
  phone: string;
  @Column({ nullable: true, type: 'varchar', length: 40 })
  email: string;
  @Column({ nullable: true, type: 'varchar', length: 200 })
  description: string;
}
