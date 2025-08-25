import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: 'Tên hiển thị của bệnh viện, ví dụ: "Bệnh viện Chợ Rẫy"' })
  name: string;

  @Column({ unique: true, comment: 'Mã bệnh viện (mabv), dùng để định danh và liên kết' })
  code: string;

  @Column({ name: 'graphql_endpoint', comment: 'URL GraphQL API của bệnh viện' })
  graphqlEndpoint: string;
  
  @Column({ default: true, name: 'is_active', comment: 'Cờ cho biết bệnh viện có đang hoạt động và hiển thị trên app hay không' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}