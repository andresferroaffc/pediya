import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from '../role';
import { Referral } from '../referral';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar' })
  names: string;
  @Column({ type: 'varchar' })
  surnames: string;
  @Column({ type: 'varchar' })
  typeDocument: string;
  @Column({ type: 'bigint', unique: true })
  document: string;
  @Column({ type: 'varchar', unique: true })
  user: string;
  @Column({ type: 'varchar', select: false })
  password: string;
  @Column({ type: 'varchar', unique: true })
  email: string;
  @Column({ type: 'bigint', unique: true })
  phone: number;
  @Column({ type: 'varchar', unique: true, nullable: true, select:false })
  resetPasswordToken: string;
  @Column({ type: 'boolean', default: true })
  status: boolean;
  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn({ name: 'role_id' })
  role: Role;
  @OneToMany(() => Referral, (referral) => referral.seller_id)
  referral: Referral[];
}
