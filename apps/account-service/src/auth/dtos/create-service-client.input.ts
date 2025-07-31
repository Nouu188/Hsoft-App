import { InputType, Field } from '@nestjs/graphql';
import { Role } from '../enums/role.enum';

@InputType()
export class CreateServiceClientInput {
  @Field()
  client_id: string;

  @Field()
  client_secret: string;

  @Field()
  name: string;

  @Field(() => [String])
  scopes: string[];
}