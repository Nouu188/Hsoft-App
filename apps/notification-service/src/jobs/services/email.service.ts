import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { NotificationHistoryService } from '../../notification-history/notification-history.service';
import { NotificationStatus, NotificationType } from '../../notification-history/entities/notification-history.entity';
import { SendTransactionalEmailCommand } from '../dto/send-transactional-email.command';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly historyService: NotificationHistoryService,
    ) {}

    async sendTransactionalEmail(command: SendTransactionalEmailCommand): Promise<void> {
        const { to, subject, template, context, history } = command;
        this.logger.log(`Attempting to send email template '${template}' to ${to}`);

        try {
            await this.mailerService.sendMail({
                to,
                subject,
                template: join(process.cwd(), 'apps/notification-service/src/templates', template),
                context,
            });

            this.logger.log(`Successfully sent email to ${to}`);

            if (history) {
                await this.historyService.create({
                    ...history,
                    status: NotificationStatus.SENT,
                    userId: history.userId || context.userId || 'system-generated',
                    type: this._mapStringToNotificationType(history.type),
                    sentAt: new Date(),
                });
            }
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error.stack);

            if (history) {
                await this.historyService.create({
                    ...history,
                    status: NotificationStatus.FAILED,
                    userId: history.userId || context.userId || 'system-generated',
                    payload: { ...(history.payload || {}), error: error.message },
                    type: this._mapStringToNotificationType(history.type),
                    sentAt: new Date(),
                });
            }

            throw error;
        }
    }

    private _mapStringToNotificationType(typeStr: string): NotificationType {
        const enumValue = Object.values(NotificationType).find(e => e === typeStr);
        return enumValue || NotificationType.GENERAL_ANNOUNCEMENT;
    }
}