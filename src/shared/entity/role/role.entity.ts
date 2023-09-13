import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  role: string;
  @Column({ nullable: false })
  detail: string;
  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
