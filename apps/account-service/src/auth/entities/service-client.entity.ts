import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ObjectType, Field, ID } from '@nestjs/graphql'; 

@ObjectType()
@Entity('service_clients')
export class ServiceClient {
  @Field(() => ID, { description: 'ID duy nhất của service, ví dụ: scheduling-service' })
  @PrimaryColumn()
  client_id: string;

  @Column({ comment: 'Secret đã được hash' })
  client_secret: string;

  @Field({ description: 'Tên của service' })
  @Column()
  name: string;

  @Field(() => [String], { description: 'Các quyền hạn được cấp' }) 
  @Column('text', { array: true })
  scopes: string[];

  @BeforeInsert()
  async hashSecret() {
    if (this.client_secret) {
      this.client_secret = await bcrypt.hash(this.client_secret, 10);
    }
  }
}