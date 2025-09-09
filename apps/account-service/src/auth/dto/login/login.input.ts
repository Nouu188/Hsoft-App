import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

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

@InputType()
export class LoginInputByEmail {
  @Field()
  @IsString()
  email: string; 
  
  @Field()
  @IsString()
  @MinLength(6)
  password: string;
}