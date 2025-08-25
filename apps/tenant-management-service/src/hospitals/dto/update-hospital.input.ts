import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

@InputType()
export class UpdateHospitalInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'GraphQL Endpoint phải là một URL hợp lệ' })
  graphqlEndpoint?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}