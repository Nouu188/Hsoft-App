import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateJobInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
