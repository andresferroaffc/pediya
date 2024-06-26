import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Role } from '../role';
import { Referral } from '../referral';
import { TypePerson } from '../../../common/enum/type-person.enum';
import { TypeDocument } from '../type_document';
import { ShoppingCart } from '../shopping-cart';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 20 })
  names: string;
  @Column({ type: 'varchar', length: 20 })
  surnames: string;
  @Column({ type: 'bigint', unique: true })
  document: string;
  @Column({ type: 'varchar', unique: true, length: 10 })
  phone1: string;
  @Column({ type: 'varchar', unique: true, length: 10 })
  phone2: string;
  @Column({ type: 'varchar', unique: true, length: 40 })
  email: string;
  @Column({ type: 'varchar', select: false, length: 80 })
  password: string;
  @Column({ type: 'varchar', length: 30 })
  address: string;
  @Column({ type: 'boolean', default: true })
  status: boolean;
  @Column({ type: 'enum', enum: TypePerson })
  type_person: TypePerson;
  @Column({ type: 'varchar', length: 20 })
  departament_code: string;
  @Column({ type: 'varchar', length: 20 })
  city_code: string;
  @Column({ type: 'varchar', unique: true })
  user: string;
  @Column({ type: 'boolean', default: false })
  is_dropshipping: boolean;
  @Column({ type: 'boolean', default: false })
  is_default_seller: boolean;
  @Column({ type: 'varchar', unique: true, nullable: true, select: false })
  reset_password_token: string;
  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn({ name: 'role_id' })
  role: Role;
  @OneToMany(() => Referral, (referral) => referral.seller_id)
  referral: Referral[];
  @ManyToOne(() => TypeDocument, (typeDocument) => typeDocument.user)
  @JoinColumn({ name: 'type_document_id' })
  type_document_id: TypeDocument;
  @OneToMany(() => Referral, (referral) => referral.user_id)
  referral2: Referral[];
  @OneToMany(
    () => ShoppingCart,
    (shoppingCart) => {
      shoppingCart.user_id;
    },
  )
  shopping_cart_id: ShoppingCart[];
  @OneToMany(
    () => ShoppingCart,
    (shoppingCart) => {
      shoppingCart.seller_id;
    },
  )
  shopping_cart_id2: ShoppingCart[];
}
