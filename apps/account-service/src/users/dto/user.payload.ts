import { Role } from '@app/auth/enums/role.enum';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { DeviceToken } from '../entities/user.entity';
import { IdentityPayload } from 'apps/tenant-management-service/src/identities/dtos/identity.payload';

@ObjectType()
export class UserPayload {
  @Field(() => ID, { description: 'Unique user ID' })
  id: string;

  @Field({ nullable: true, description: 'Phone number (unique)' })
  phoneNumber?: string;

  @Field({ nullable: true, description: 'Địa chỉ email (duy nhất)' })
  email?: string;

  @Field({ nullable: true, description: 'Google account ID' })
  googleId?: string;

  @Field(() => [DeviceToken], { nullable: true, description: 'List of device tokens (FCM/APN)' })
  deviceTokens?: DeviceToken[];

  @Field(() => [Role], { description: 'User roles' })
  roles: Role[];

  @Field({ description: 'Flag indicating whether email is verified' })
  isEmailVerified: boolean;

  @Field(() => IdentityPayload, { nullable: true, description: 'User personal information' })
  identity?: IdentityPayload;

  @Field({ description: 'Creation date' })
  createdAt: Date;

  @Field({ description: 'Last update date' })
  updatedAt: Date;
}