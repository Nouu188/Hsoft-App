import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CheckMembershipDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  tenantId: string; // reuse hospitalId or tenantId

  @IsString()
  role: string;
}
