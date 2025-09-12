import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator';

export class DosesAllSyncCommand {
  @IsUUID('4', { message: 'userId phải là một UUID hợp lệ' })
  userId: string;
  
  @IsUrl({}, { message: 'hospitalUrl không hợp lệ' })
  @IsNotEmpty({ message: 'hospitalUrl không được để trống' })
  hospitalUrl: string;
}