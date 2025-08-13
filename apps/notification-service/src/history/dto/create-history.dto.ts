import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { NotificationStatus, NotificationType } from '../entities/notification-history.entity';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateHistoryDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field(() => NotificationType)
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  dose_ids?: string[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  payload?: Record<string, any>;

  @Field(() => NotificationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}
