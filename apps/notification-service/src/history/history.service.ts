// apps/notification-service/src/history/history.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GetHistoryArgs } from './dto/get-history.args';
import { NotificationHistory, NotificationStatus } from './entities/notification-history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(NotificationHistory, 'notificationConnection')
    private readonly historyRepository: Repository<NotificationHistory>,
  ) {}

  async create(dto: CreateHistoryDto): Promise<NotificationHistory> {
    this.logger.log(`Creating notification history for user ${dto.user_id} with type ${dto.type}`);
    try {
      const historyEntry = this.historyRepository.create({
        user_id: dto.user_id,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        dose_ids: dto.dose_ids,
        payload: dto.payload,
        status: dto.status,
      });
      
      const savedEntry = await this.historyRepository.save(historyEntry);
      this.logger.log(`Successfully created history entry with ID: ${savedEntry.id}`);
      return savedEntry;
    } catch (error) {
      this.logger.error(`Failed to create notification history for user ${dto.user_id}`, error.stack);
      throw error; // Ném lại lỗi để lớp gọi có thể xử lý
    }
  }

  async getHistoryForUser(user_id: string, args: GetHistoryArgs): Promise<NotificationHistory[]> {
    this.logger.debug(`Fetching notification history for user ${user_id} with args: ${JSON.stringify(args)}`);
    return this.historyRepository.find({
      where: { user_id: user_id },
      order: { sentAt: 'DESC' },
      skip: args.offset,
      take: args.limit,
    });
  }

  async countUnread(user_id: string): Promise<number> {
    this.logger.debug(`Counting unread notifications for user ${user_id}`);
    return this.historyRepository.count({
      where: {
        user_id: user_id,
        status: NotificationStatus.SENT, // Giả sử SENT là chưa đọc
      },
    });
  }

  async markAsRead(user_id: string, notificationIds: string[]): Promise<boolean> {
    if (notificationIds.length === 0) {
      this.logger.warn(`markAsRead called with an empty array for user ${user_id}.`);
      return false;
    }
    this.logger.log(`Marking ${notificationIds.length} notification(s) as read for user ${user_id}.`);
    
    const result = await this.historyRepository.update(
      { id: In(notificationIds), user_id: user_id }, // Sử dụng camelCase
      { status: NotificationStatus.READ },
    );

    if (result.affected === 0) {
      this.logger.warn(`No notifications found or matched for user ${user_id} to mark as read.`);
    } else {
      this.logger.log(`Successfully updated ${result.affected} notification(s) to READ status.`);
    }
    
    return result.affected! > 0;
  }

  async deleteNotification(user_id: string, notificationId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete notification ${notificationId} for user ${user_id}`);
    
    const result = await this.historyRepository.delete({ id: notificationId, user_id: user_id }); 

    if (result.affected === 0) {
      this.logger.warn(`Delete failed: Notification with ID ${notificationId} not found for user ${user_id}.`);
      throw new NotFoundException(`Notification with ID ${notificationId} not found or you do not have permission to delete it.`);
    }

    this.logger.log(`Successfully deleted notification ${notificationId}.`);
    return true;
  }
}