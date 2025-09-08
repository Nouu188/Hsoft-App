import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { NotificationType } from '../../notification-history/entities/notification-history.entity';

class EmailHistoryDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsString()
    type: NotificationType | string; 

    @IsString()
    title: string;

    @IsString()
    body: string;

    @IsOptional()
    @IsObject()
    payload?: Record<string, any>;
}

export class SendTransactionalEmailCommand {
    @IsEmail()
    to: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    template: string;

    @IsObject()
    context: Record<string, any>;

    @IsOptional()
    @ValidateNested()
    @Type(() => EmailHistoryDto)
    history?: EmailHistoryDto;
}