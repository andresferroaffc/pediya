import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true, length: 17 })
  name: string;
  @Column({ nullable: false, length: 20 })
  description: string;
  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
