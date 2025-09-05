import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

/**
 * Command được gửi từ Orchestrator đến Scheduling Service
 * để yêu cầu đồng bộ hóa lịch sử tiêm chủng của một người dùng.
 */
export class SyncDoseHistoryCommand {
  @IsUUID('4', { message: 'userId phải là một UUID hợp lệ' })
  userId: string;

  @IsString()
  phoneNumber: string;

  @IsUrl({}, { message: 'hospitalUrl không hợp lệ' })
  @IsNotEmpty({ message: 'hospitalUrl không được để trống' })
  hospitalUrl: string;
}