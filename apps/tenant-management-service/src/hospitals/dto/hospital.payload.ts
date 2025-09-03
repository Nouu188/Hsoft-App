import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HospitalPayload {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Tên bệnh viện' })
  name: string;

  @Field({ nullable: true, description: 'Mã ngoài hệ thống (nếu có)' })
  externalCode?: string;

  @Field({ nullable: true })
  plainExternalCode: string;

  @Field({ description: 'GraphQL endpoint của bệnh viện' })
  graphqlEndpoint?: string;
}
