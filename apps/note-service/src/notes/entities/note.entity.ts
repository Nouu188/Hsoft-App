import { ObjectType, Field, ID } from '@nestjs/graphql';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  Index, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn 
} from 'typeorm';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType() 
@Entity('notes')
export class Note {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field() 
  @Column({ length: 255 })
  @Index()
  title: string;

  @Field()
  @Column('text')
  content: string;

  @Field(() => GraphQLJSONObject, { nullable: true }) 
  @Column({ type: 'jsonb', nullable: true })
  metadata?: object; 

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index() 
  userId?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}