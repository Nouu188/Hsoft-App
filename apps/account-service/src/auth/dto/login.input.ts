import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInputByIdentifier {
  @Field()
  @IsString()
  identifier: string; 

  @Field()
  @IsString()  
  password?: string;
}

@InputType()
export class LoginInputByEmail {
  @Field()
  @IsString()
  email: string; 

  @Field()
  @IsString()
  hoten: string; 

  @Field()
  @IsString()
  @MinLength(6)
  password: string;
}