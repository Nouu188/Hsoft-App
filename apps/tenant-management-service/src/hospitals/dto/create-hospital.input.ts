import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateHospitalInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  externalCode: string;

  @Field()
  @IsUrl({}, { message: 'GraphQL Endpoint phải là một URL hợp lệ' })
  graphqlEndpoint: string;

  @Field({ nullable: true })
  plainExternalCode: string;

  @Field({ defaultValue: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}