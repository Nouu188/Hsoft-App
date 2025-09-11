import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LoginInputByPhoneNumber {
  @Field()
  @IsString()
  phoneNumber: string; 

  @Field()
  @IsString()  
  password: string;

  @Field()
  @IsString()
  externalHospitalCode: string; 
}