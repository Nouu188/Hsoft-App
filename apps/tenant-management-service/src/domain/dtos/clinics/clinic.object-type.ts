import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType('ClinicObjectType')
export class ClinicObjectType {
  @Field(() => ID, { description: 'ID nội bộ của phòng khám' })
  id: string;

  @Field({ description: 'Mã khoa phòng từ hệ thống bệnh viện' })
  externalCode: string;

  @Field()
  name: string; b  
}