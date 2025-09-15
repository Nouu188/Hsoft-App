import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { MetricLabel, MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { YLenhThuoc } from '@app/common/types';
import { OutboxService } from '@app/outbox';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { DoseSchedulerService, IDoseRepository } from 'apps/scheduling-service/src/domain';
import { DoseTransactionService } from 'apps/scheduling-service/src/infrastructure';
import { Counter, Histogram } from 'prom-client';
import { SyncAllDosesByUserCommand } from '../SyncAllDosesByUser.command';

@CommandHandler(SyncAllDosesByUserCommand)
export class SyncAllDosesByUserHandler implements ICommandHandler<SyncAllDosesByUserCommand> {
    private readonly logger = new Logger(SyncAllDosesByUserHandler.name);

    constructor(
        private readonly accountClient: AccountApiClientService,
        private readonly hospitalClient: HospitalApiClientService,
        @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository,
        private readonly doseTx: DoseTransactionService,
        @Inject('OutboxService_schedulingConnection') private readonly outboxService: OutboxService,
        private readonly doseScheduler: DoseSchedulerService, 

        @InjectMetric(MetricName.DOSES_SYNCED_TOTAL)
        private readonly dosesSyncedCounter: Counter<string>,

        @InjectMetric(MetricName.DOSES_DELETED_TOTAL)
        private readonly dosesDeletedCounter: Counter<string>,

        @InjectMetric(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL)
        private readonly notificationsScheduledCounter: Counter<string>,

        @InjectMetric(MetricName.DB_QUERY_DURATION_SECONDS)
        private readonly dbQueryDurationHistogram: Histogram<string>,

        @InjectMetric(MetricName.SYNC_DURATION_SECONDS)
        private readonly syncDurationHistogram: Histogram<string>,
    ) { }

    async execute(command: SyncAllDosesByUserCommand) {
        const { userId, hospitalUrl } = command;
        const endTimer = this.syncDurationHistogram.startTimer({
            [MetricLabel.SYNC_TYPE]: 'full_history',
        });

        let created = 0;
        let deleted = 0;
        let notificationsScheduled = 0;

        try {

            const user = await this.accountClient.fetchUserById(userId).catch(err => {
                this.logger.error(`[SyncAllDoses] Failed to fetch userId=${userId}`, err.stack);
                throw err;
            });

            if (!user) {
                this.logger.warn(`[SyncAllDoses] User not found userId=${userId}`);
                return { created, deleted, notificationsScheduled };
            }
            if (!user.phoneNumber) {
                this.logger.warn(`[SyncAllDoses] User has no phone number userId=${userId}`);
                return { created, deleted, notificationsScheduled };
            }

            this.logger.log(`[SyncAllDoses] Start full sync userId=${userId} phone=${user.phoneNumber}`);

            const ylenhthuoc: YLenhThuoc[] = await this.hospitalClient
                .fetchYLenhThuoc(user.phoneNumber, hospitalUrl)
                .catch(err => {
                    this.logger.error(`[SyncAllDoses] Failed fetch treatment userId=${userId}`, err.stack);
                    throw err;
                });

            if (!ylenhthuoc || ylenhthuoc.length === 0) {
                this.logger.log(`[SyncAllDoses] No treatment records from hospital userId=${userId}`);
                return { created, deleted, notificationsScheduled };
            }

            const dosesToSave = this.doseScheduler.buildDosesFromYLenh(userId, ylenhthuoc);

            if (dosesToSave.length === 0) {
                this.logger.log(`[SyncAllDoses] No valid doses userId=${userId}`);
                return { created, deleted, notificationsScheduled };
            }

            await this.doseTx.execute(async manager => {
                const dbEndDelete = this.dbQueryDurationHistogram.startTimer({
                    [MetricLabel.QUERY_TYPE]: 'DELETE',
                    [MetricLabel.TABLE_NAME]: 'dose',
                });
                deleted = await this.doseRepo.deleteByUserId(userId, manager);
                dbEndDelete();

                if (deleted > 0) {
                    this.dosesDeletedCounter.inc(
                        { [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'success' },
                        deleted,
                    );
                }
                this.logger.log(`[SyncAllDoses] Deleted ${deleted} old doses userId=${userId}`);

                const dbEndInsert = this.dbQueryDurationHistogram.startTimer({
                    [MetricLabel.QUERY_TYPE]: 'INSERT',
                    [MetricLabel.TABLE_NAME]: 'dose',
                });
                await this.doseRepo.save(dosesToSave, manager);
                dbEndInsert();

                created = dosesToSave.length;
                this.dosesSyncedCounter.inc(
                    { [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'success' },
                    created,
                );
                this.logger.log(`[SyncAllDoses] Created ${created} new doses userId=${userId}`);
            });

            const { notificationsToSchedule } = this.doseScheduler.groupUpcomingDosesForNotification(dosesToSave);
            let storedCount = 0;
            for (const group of notificationsToSchedule.values()) {
                const delay = group.notifyAt.getTime() - Date.now();
                if (delay > 0) {
                    await this.outboxService.createOutboxMessage({
                        aggregateType: 'notification',
                        aggregateId: group.userId,
                        eventType: 'GroupedNotificationScheduled',
                        payload: group,
                        exchange: ExchangeName.NOTIFICATION,
                        routingKey: RoutingKey.NOTIFICATION_SCHEDULED,
                    });
                    storedCount++;
                }
            }

            notificationsScheduled = Array.from(notificationsToSchedule.values()).reduce(
                (sum, g) => sum + g.doseIds.length,
                0,
            );
            this.notificationsScheduledCounter.inc(
                { [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'success' },
                notificationsScheduled,
            );
            this.logger.log(
                `[SyncAllDoses] Stored ${storedCount} grouped notification events into outbox for user ${userId}`,
            );

            return { created, deleted, notificationsScheduled };
        } catch (error) {
            this.logger.error(`[SyncAllDoses] Failed userId=${userId}`, error.stack);
            this.dosesSyncedCounter.inc({ [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'error' });
            this.dosesDeletedCounter.inc({ [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'error' });
            this.notificationsScheduledCounter.inc({
                [MetricLabel.SYNC_TYPE]: 'full_history',
                [MetricLabel.STATUS]: 'error',
            });
            throw error;
        } finally {
            endTimer();
        }
    }
}
