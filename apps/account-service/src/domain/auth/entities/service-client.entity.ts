import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ObjectType, Field, ID } from '@nestjs/graphql'; 

@ObjectType()
@Entity('service_clients')
export class ServiceClient {
  @Field(() => ID, { description: 'ID duy nhất của service, ví dụ: scheduling-service' })
  @PrimaryColumn({ name: "client_id", comment: 'ID duy nhất của service, ví dụ: scheduling-service' })
  clientId: string;

  @Field({ description: 'Secret đã được hash' })
  @Column({ name: "client_secret" })
  clientSecret: string;

  @Field({ description: 'Tên của service' })
  @Column()
  name: string;

  @Field(() => [String], { description: 'Các quyền hạn được cấp' }) 
  @Column('text', { array: true })
  scopes: string[];

  @BeforeInsert()
  async hashSecret() {
    if (this.clientSecret) {
      this.clientSecret = await bcrypt.hash(this.clientSecret, 10);
    }
  }
}