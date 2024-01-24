import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user';

@Entity('type_documents')
export class TypeDocument {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true, length: 25 })
  name: string;
  @Column({ nullable: true, length: 200 })
  description: string;
  @OneToMany(() => User, (user) => user.type_document_id)
  user: User[];
}
