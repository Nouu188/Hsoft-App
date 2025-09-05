import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AssignHospitalDto {
  @IsUUID()
  membershipId: string;

  @IsUUID()
  hospitalId: string;

  @IsOptional()
  @IsString()
  hospitalRole?: string;
}
