import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { GetHistoryArgs } from './dto/get-history.args';
import { NotificationHistory, NotificationStatus } from './entities/notification-history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class NotificationHistoryService {
  private readonly logger = new Logger(NotificationHistoryService.name);

  constructor(
    @InjectRepository(NotificationHistory, 'notificationConnection')
    private readonly historyRepository: Repository<NotificationHistory>,

    @InjectDataSource('notificationConnection') 
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

  async getHistoryForUser(userId: string, args: GetHistoryArgs): Promise<NotificationHistory[]> {
    this.logger.debug(
      `Fetching notification history for user ${userId} with args: ${JSON.stringify(args)}`,
    );
    return this.historyRepository.find({
      where: { userId },
      order: { sentAt: 'DESC' },
      skip: args.offset,
      take: args.limit,
    });
  }

  async countUnread(userId: string): Promise<number> {
    this.logger.debug(`Counting unread notifications for user ${userId}`);
    return this.historyRepository.count({
      where: { userId, status: NotificationStatus.SENT },
    });
  }

  // ============================================================
  // MUTATIONS (WRITE - with transaction)
  // ============================================================

  async create(dto: CreateHistoryDto): Promise<NotificationHistory> {
    this.logger.log(
      `Creating notification history for user ${dto.userId} with type ${dto.type}`,
    );

    return this.dataSource.transaction(async (manager) => {
      const historyEntry = manager.create(NotificationHistory, {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        doseIds: dto.doseIds,
        payload: dto.payload,
        status: dto.status,
      });

      const savedEntry = await manager.save(historyEntry);
      this.logger.log(`Successfully created history entry with ID: ${savedEntry.id}`);
      return savedEntry;
    });
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<boolean> {
    if (notificationIds.length === 0) {
      this.logger.warn(`markAsRead called with an empty array for user ${userId}.`);
      return false;
    }

    this.logger.log(
      `Marking ${notificationIds.length} notification(s) as read for user ${userId}.`,
    );

    return this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        NotificationHistory,
        { id: In(notificationIds), userId },
        { status: NotificationStatus.READ },
      );

      if (result.affected === 0) {
        this.logger.warn(
          `No notifications found or matched for user ${userId} to mark as read.`,
        );
        return false;
      }

      this.logger.log(
        `Successfully updated ${result.affected} notification(s) to READ status.`,
      );
      return true;
    });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete notification ${notificationId} for user ${userId}`);

    return this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(NotificationHistory, { id: notificationId, userId });

      if (result.affected === 0) {
        this.logger.warn(
          `Delete failed: Notification with ID ${notificationId} not found for user ${userId}.`,
        );
        throw new NotFoundException(
          `Notification with ID ${notificationId} not found or you do not have permission to delete it.`,
        );
      }

      this.logger.log(`Successfully deleted notification ${notificationId}.`);
      return true;
    });
  }
}
