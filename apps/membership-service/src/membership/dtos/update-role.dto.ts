import { Role } from '@app/auth';
import { IsUUID,IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @IsUUID()
  membershipId: string;

  @IsNotEmpty()
  @IsEnum(Role, { message: 'newRole must be a valid Role enum' })
  newRole: Role;
}
