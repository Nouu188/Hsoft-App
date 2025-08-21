import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '@app/auth/enums/role.enum';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt'

@ObjectType('User')
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: 'Họ và tên đầy đủ của người dùng' })
  @Column({ name: 'ho_ten', nullable: true })
  hoten: string;

  @Field({ nullable: true, description: 'Địa chỉ email (duy nhất)' })
  @Column({ unique: true, nullable: true })
  email?: string;

  @Field({ nullable: true, description: 'Mã bệnh nhân từ hệ thống bệnh viện (duy nhất)' })
  @Column({ unique: true, nullable: true })
  mabn?: string;

  @Field({ nullable: true, description: 'Số điện thoại (duy nhất)' })
  @Column({ unique: true, nullable: true, name: 'so_dien_thoai' })
  sodienthoai?: string;

  @Field({ nullable: true, description: 'Số CMND/CCCD (duy nhất)' })
  @Column({ unique: true, nullable: true, name: 'so_cmnd' })
  socmnd?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  diachi?: string;

  @Field({ nullable: true, description: 'URL ảnh đại diện' })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true, description: 'ID người dùng từ Google' })
  @Column({ name: 'google_id', unique: true, nullable: true })
  googleId?: string;

  @Field({ nullable: true, description: 'Năm sinh của bệnh nhân' })
  @Column({ nullable: true, name: 'nam_sinh' })
  namsinh?: string; 

  @Column()
  @Exclude()  
  password: string;
  
  // --- Trường Token Thông báo ---
  @Field(() => [String], { nullable: 'itemsAndList', description: 'Danh sách FCM token cho thiết bị Android' })
  @Column({ type: 'text', array: true, nullable: true, name: 'fcm_tokens' })
  fcm_tokens?: string[];

  @Field(() => [String], { nullable: 'itemsAndList', description: 'Danh sách APN token cho thiết bị iOS' })
  @Column({ type: 'text', array: true, nullable: true, name: 'apn_tokens' })
  apn_tokens?: string[];

  // --- Trường Vai trò & Trạng thái ---
  @Field(() => [Role])
  @Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
  roles: Role[];

  @Field({ description: 'Cờ cho biết email đã được xác thực hay chưa' })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  // --- Các cột Metadata ---
  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Dùng cho soft delete
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
}