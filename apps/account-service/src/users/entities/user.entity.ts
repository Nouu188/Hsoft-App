import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '../../auth/enums/role.enum';
import * as bcrypt from 'bcrypt'

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: true })
  hoTen: string;

  @Field()
  @Column({ unique: true, nullable: true })
  mabn: string;

  @Field()
  @Column({ unique: true })
  sodienthoai: string;

  @Field()
  @Column({ unique: true, nullable: true })
  socmnd: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  diachi?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ngaysinh?: string; 

  @Column()
  password: string;
  
  @Field(() => [String], { nullable: true })
  @Column({ type: 'text', array: true, nullable: true })
  fcm_tokens?: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'text', array: true, nullable: true })
  apn_tokens?: string[];

  @Field(() => [String])
  @Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
  roles: Role[];

  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
}