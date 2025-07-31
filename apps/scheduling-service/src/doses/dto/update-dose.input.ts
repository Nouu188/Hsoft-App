import { CreateDoseInput } from './create-dose.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDoseInput extends PartialType(CreateDoseInput) {
  @Field(() => Int)
  id: number;
}
