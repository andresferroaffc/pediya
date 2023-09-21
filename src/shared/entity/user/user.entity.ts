import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Role } from '../role';

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
  phone: string;
  @Column({ type: 'varchar', unique: true, nullable: true, select:false })
  resetPasswordToken: string;
  @Column({ type: 'boolean', default: true })
  status: boolean;
  @ManyToOne(() => Role, (role) => role.user)
  role: Role;
}
