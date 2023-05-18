import { Product } from '../../products/entities/product.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
    unique: true,
  })
  email: string;

  @Column('text', {
    nullable: false,
    select: false,
  })
  password: string;

  @Column('text', {
    name: 'full_name',
    nullable: false,
  })
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  //producto
  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @Column('text', {
    nullable: true,
    name: 'token_refresh',
  })
  tokenRefresh: string;

  @BeforeInsert()
  checkEmailCamelCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeUpdate()
  checkUpdateEmailCamelCase() {
    this.checkEmailCamelCase();
  }
}
