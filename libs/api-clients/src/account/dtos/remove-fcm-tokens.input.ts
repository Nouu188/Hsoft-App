import { InputType, Field, ID } from '@nestjs/graphql'; 
import { IsArray, IsString } from 'class-validator';

@InputType()
export class RemoveFcmTokensInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  tokens: string[];
}