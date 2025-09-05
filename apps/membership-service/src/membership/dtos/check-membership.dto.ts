import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateMembershipDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  identityId: string;

  @IsOptional()
  @IsString()
  role?: string; // e.g. DOCTOR|PATIENT|STAFF|ADMIN

  @IsOptional()
  isActive?: boolean;
}
