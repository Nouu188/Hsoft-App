import { Role } from '@app/auth/enums/role.enum';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@ObjectType()
export class DeviceToken {
  @Field() token: string;
  @Field() type: 'FCM' | 'APN';
}

@ObjectType('User')
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string; 

  @Field({ nullable: true })
  @Column({ name: 'google_id', unique: true, nullable: true })
  googleId?: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @Field({ nullable: true, description: 'Địa chỉ email (duy nhất)' })
  @Column({ unique: true, nullable: true })
  email?: string;

  @Field({ nullable: true, description: 'URL ảnh đại diện' })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  // --- Roles ---
  @Field(() => [Role])
  @Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
  roles: Role[];

  @Field({ description: 'Flag indicating whether email is verified' })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  // --- Metadata ---
  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // --- Notification tokens stored as JSON ---
  @Field(() => [DeviceToken], { nullable: true, description: 'Danh sách token thiết bị' })
  @Column({ type: 'text', array: true, nullable: true, name: 'fcm_tokens' })
  deviceTokens?: DeviceToken[];

  // --- Hooks ---
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
