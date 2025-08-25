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
    this.logger.log(`Creating notification history for user ${dto.userId} with type ${dto.type}`);
    try {
      const historyEntry = this.historyRepository.create({
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        doseIds: dto.doseIds,
        payload: dto.payload,
        status: dto.status,
      });
      
      const savedEntry = await this.historyRepository.save(historyEntry);
      this.logger.log(`Successfully created history entry with ID: ${savedEntry.id}`);
      return savedEntry;
    } catch (error) {
      this.logger.error(`Failed to create notification history for user ${dto.userId}`, error.stack);
      throw error; // Ném lại lỗi để lớp gọi có thể xử lý
    }
  }

  async getHistoryForUser(userId: string, args: GetHistoryArgs): Promise<NotificationHistory[]> {
    this.logger.debug(`Fetching notification history for user ${userId} with args: ${JSON.stringify(args)}`);
    return this.historyRepository.find({
      where: { userId: userId },
      order: { sentAt: 'DESC' },
      skip: args.offset,
      take: args.limit,
    });
  }

  async countUnread(userId: string): Promise<number> {
    this.logger.debug(`Counting unread notifications for user ${userId}`);
    return this.historyRepository.count({
      where: {
        userId: userId,
        status: NotificationStatus.SENT, // Giả sử SENT là chưa đọc
      },
    });
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<boolean> {
    if (notificationIds.length === 0) {
      this.logger.warn(`markAsRead called with an empty array for user ${userId}.`);
      return false;
    }
    this.logger.log(`Marking ${notificationIds.length} notification(s) as read for user ${userId}.`);
    
    const result = await this.historyRepository.update(
      { id: In(notificationIds), userId: userId }, // Sử dụng camelCase
      { status: NotificationStatus.READ },
    );

    if (result.affected === 0) {
      this.logger.warn(`No notifications found or matched for user ${userId} to mark as read.`);
    } else {
      this.logger.log(`Successfully updated ${result.affected} notification(s) to READ status.`);
    }
    
    return result.affected! > 0;
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete notification ${notificationId} for user ${userId}`);
    
    const result = await this.historyRepository.delete({ id: notificationId, userId: userId }); 

    if (result.affected === 0) {
      this.logger.warn(`Delete failed: Notification with ID ${notificationId} not found for user ${userId}.`);
      throw new NotFoundException(`Notification with ID ${notificationId} not found or you do not have permission to delete it.`);
    }

    this.logger.log(`Successfully deleted notification ${notificationId}.`);
    return true;
  }
}