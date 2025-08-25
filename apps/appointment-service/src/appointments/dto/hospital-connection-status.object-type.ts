import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';

export enum ConnectionStatus {
  LINKED = 'LINKED',
  NOT_LINKED = 'NOT_LINKED',
}

registerEnumType(ConnectionStatus, { name: 'ConnectionStatus' });

@ObjectType('HospitalConnectionStatus')
export class HospitalConnectionStatusObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field(() => ConnectionStatus)
  connectionStatus: ConnectionStatus;
}