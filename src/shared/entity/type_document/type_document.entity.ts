import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('type_documents')
export class TypeDocument {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, unique: true })
  name: string;
  @Column({ nullable: true })
  description: string;
}
