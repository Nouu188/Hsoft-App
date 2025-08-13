// apps/notification-service/src/history/dto/mark-as-read.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';
import { IsArray, IsUUID } from 'class-validator';

@InputType()
export class MarkAsReadInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds: string[];
}