import { HospitalApiClientService } from "@app/api-clients/hospital/hospital-api.service";
import { MetricLabel, MetricName } from "@app/common/metrics/contracts/metrics.contracts";
import { ExchangeName } from "@app/common/rabbitmq/exchanges";
import { RoutingKey } from "@app/common/rabbitmq/routing-keys";
import { YLenhThuoc } from "@app/common/types";
import { OutboxService } from "@app/outbox";
import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { DoseSchedulerService, DoseStatus, IDoseRepository } from "apps/scheduling-service/src/domain";
import { DoseTransactionService } from "apps/scheduling-service/src/infrastructure";
import { Counter, Histogram } from "prom-client";
import { SyncDosesInFutureCommand } from "../impl/sync-doses-in-future.command";

@CommandHandler(SyncDosesInFutureCommand)
export class SyncDosesInFutureHandler implements ICommandHandler<SyncDosesInFutureCommand> {
  private readonly logger = new Logger(SyncDosesInFutureHandler.name);

  constructor(
    private readonly hospitalClient: HospitalApiClientService,
    private readonly transactionService: DoseTransactionService,
    @Inject('OutboxService_schedulingConnection') private readonly outboxService: OutboxService,
    @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository,
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
  ) {}

  async execute(command: SyncDosesInFutureCommand) {
    const { user, graphqlEndpoint } = command;
    const endTimer = this.syncDurationHistogram.startTimer({ [MetricLabel.SYNC_TYPE]: 'future_only' });

    let created = 0;
    let deleted = 0;
    let notificationsScheduled = 0;

    try {
      if (!user.phoneNumber) throw new Error("User phoneNumber is required.");

      const ylenhthuoc: YLenhThuoc[] = await this.hospitalClient.fetchYLenhThuoc(user.phoneNumber, graphqlEndpoint);
      if (!ylenhthuoc || ylenhthuoc.length === 0) {
        this.logger.log(`[SyncDosesInFuture] No treatments for user ${user.id}`);
        return { created, deleted, notificationsScheduled };
      }

      const dosesToSave = this.doseScheduler.buildDosesFromYLenh(user.id, ylenhthuoc);
      if (dosesToSave.length === 0) {
        this.logger.log(`[SyncDosesInFuture] No valid doses for user ${user.id}`);
        return { created, deleted, notificationsScheduled };
      }

      await this.transactionService.execute(async manager => {
        const dbEndSelect = this.dbQueryDurationHistogram.startTimer({
          [MetricLabel.QUERY_TYPE]: 'SELECT',
          [MetricLabel.TABLE_NAME]: 'dose',
        });
        const existingPending = await this.doseRepo.findByUserIdAndStatus(user.id, DoseStatus.PENDING, manager);
        dbEndSelect();

        const existingMap = new Map(existingPending.map(d => [d.external_id, d]));
        const dosesToCreate = dosesToSave.filter(d => !existingMap.has(d.external_id!));
        const dosesToDelete = existingPending.filter(d => !dosesToSave.some(nd => nd.external_id === d.external_id));

        if (dosesToDelete.length > 0) {
          const dbEndDelete = this.dbQueryDurationHistogram.startTimer({
            [MetricLabel.QUERY_TYPE]: 'DELETE',
            [MetricLabel.TABLE_NAME]: 'dose',
          });
          await this.doseRepo.deleteByIds(dosesToDelete.map(d => d.id), manager);
          dbEndDelete();

          deleted = dosesToDelete.length;
          this.dosesDeletedCounter.inc({ [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'success' }, deleted);
          this.logger.log(`[SyncDosesInFuture] Deleted ${deleted} obsolete pending doses for user ${user.id}`);
        }

        if (dosesToCreate.length > 0) {
          const dbEndInsert = this.dbQueryDurationHistogram.startTimer({
            [MetricLabel.QUERY_TYPE]: 'INSERT',
            [MetricLabel.TABLE_NAME]: 'dose',
          });
          await this.doseRepo.save(dosesToCreate, manager);
          dbEndInsert();

          created = dosesToCreate.length;
          this.dosesSyncedCounter.inc({ [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'success' }, created);
          this.logger.log(`[SyncDosesInFuture] Created ${created} new doses for user ${user.id}`);
        }
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
        { [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'success' },
        notificationsScheduled,
      );
      this.logger.log(`[SyncDosesInFuture] Stored ${storedCount} grouped notifications for user ${user.id}`);

      return { created, deleted, notificationsScheduled };
    } catch (error) {
      this.logger.error(`[SyncDosesInFuture] Failed for user ${user.id}`, error.stack);
      this.dosesSyncedCounter.inc({ [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'error' });
      this.dosesDeletedCounter.inc({ [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'error' });
      this.notificationsScheduledCounter.inc({ [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'error' });
      throw error;
    } finally {
      endTimer();
    }
  }
}
