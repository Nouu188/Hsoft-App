import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDoseInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
