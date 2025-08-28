import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { Identity } from '../../identities/entities/identity.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Hospital')
@Entity('hospitals')
export class Hospital {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'external_code', unique: true, nullable: true })
  externalCode: string;

  @Field()
  @Column({ name: 'graphql_endpoint', unique: true })
  graphqlEndpoint: string;

  @Field()
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Field(() => [Clinic], { nullable: true })
  @OneToMany(() => Clinic, clinic => clinic.hospital)
  clinics: Clinic[];

  @Field(() => [Identity], { nullable: true })
  @ManyToMany(() => Identity, identity => identity.hospitals)
  identities?: Identity[];

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}