import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { NotificationApiClientService } from '@app/api-clients/notification/notification-api-client.service';
import { MetricLabel, MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { UserPayload } from 'apps/account-service/src/users/dto/user.payload';
import { Dose, DoseStatus, MealRelation } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import * as moment from 'moment-timezone';
import { Counter, Histogram } from 'prom-client';
import { DataSource, In } from 'typeorm';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { YLenhThuoc } from '@app/common/types';

export interface SyncResult {
    created: number;
    deleted: number;
    notificationsScheduled: number;
}

@Injectable()
export class DosesSyncService {
    private readonly logger = new Logger(DosesSyncService.name);

    constructor(
        private readonly hospitalClient: HospitalApiClientService,
        private readonly notificationClient: NotificationApiClientService,
        private readonly accountClient: AccountApiClientService,
        private readonly dataSource: DataSource,

        @InjectMetric(MetricName.DOSES_SYNCED_TOTAL)
        private readonly dosesSyncedCounter: Counter<string>,

        @InjectMetric(MetricName.DOSES_DELETED_TOTAL)
        private readonly dosesDeletedCounter: Counter<string>,

        @InjectMetric(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL)
        private readonly notificationsScheduledCounter: Counter<string>,

        @InjectMetric(MetricName.DB_QUERY_DURATION_SECONDS)
        private readonly dbQueryDurationHistogram: Histogram<string>,

        @InjectMetric(MetricName.SYNC_DURATION_SECONDS) // <-- thêm metric mới
        private readonly syncDurationHistogram: Histogram<string>,
    ) { }

    public async syncDosesInFuture(user: UserPayload, ngay: string = "") {
        const endTimer = this.syncDurationHistogram.startTimer({
            [MetricLabel.SYNC_TYPE]: "future_only",
        });

        let created = 0;
        let deleted = 0;
        let notificationsScheduled = 0;

        try {
            const today = moment().tz("Asia/Ho_Chi_Minh");
            const phoneNumber = user.phoneNumber;
            if (!phoneNumber) throw new Error("User phoneNumber is required.");

            let ylenhthuoc: YLenhThuoc[];
            try {
                ylenhthuoc = await this.hospitalClient.fetchYLenhThuoc(phoneNumber, ngay);
            } catch (error) {
                this.logger.error(
                    `[DosesSyncService] Failed to fetch y lenh thuoc for user ${user.id}`,
                    error.stack,
                );
                throw error;
            }

            if (!ylenhthuoc || ylenhthuoc.length === 0) {
                this.logger.log(
                    `[DosesSyncService] No treatments found for user ${user.id} on ${today.format("DD/MM/YYYY")}.`,
                );
                return { created: 0, deleted: 0, notificationsScheduled: 0 };
            }

            const newDosesMap = new Map<string, Partial<Dose>>();

            for (const ylenh of ylenhthuoc) {
                if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.songay) continue;

                const startDate = moment.tz(ylenh.ngay, "DD/MM/YYYY", "Asia/Ho_Chi_Minh");
                const numberOfDays = parseInt(ylenh.songay, 10);
                if (isNaN(numberOfDays) || numberOfDays <= 0) continue;

                for (let i = 0; i < numberOfDays; i++) {
                    const currentDate = startDate.clone().add(i, "days");
                    const dueAt = moment.tz(
                        `${currentDate.format("DD/MM/YYYY")} ${ylenh.thoidiem}`,
                        "DD/MM/YYYY HH:mm",
                        "Asia/Ho_Chi_Minh",
                    );
                    if (dueAt.isBefore(today)) continue;

                    const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format("YYYYMMDDHHmm")}`;
                    if (newDosesMap.has(externalId)) continue;

                    const mealRelation: MealRelation | null = (() => {
                        switch (ylenh.thuchien) {
                            case "Trước ăn":
                                return { type: "BEFORE", minutes: 30 };
                            case "Sau ăn":
                                return { type: "AFTER", minutes: 0 };
                            case "Trong bữa ăn":
                                return { type: "WITH", minutes: 0 };
                            default:
                                return null;
                        }
                    })();

                    newDosesMap.set(externalId, {
                        external_id: externalId,
                        userId: user.id,
                        due_at: dueAt.toDate(),
                        notify_at: dueAt.clone().subtract(15, "minutes").toDate(),
                        status: DoseStatus.UPCOMING,
                        ylenh_id: ylenh.id,
                        ylenh_stt: ylenh.stt,
                        medication_name: ylenh.tenthuoc,
                        dosage_instructions: ylenh.lieudung,
                        usage_instructions: ylenh.thuchien,
                        meal_relation: mealRelation,
                    });
                }
            }

            const dosesToSave = Array.from(newDosesMap.values());
            const queryRunner = this.dataSource.createQueryRunner();

            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                // đo thời gian query DB
                const dbEndTimer = this.dbQueryDurationHistogram.startTimer({
                    [MetricLabel.QUERY_TYPE]: "SELECT",
                    [MetricLabel.TABLE_NAME]: "dose",
                });

                const existingPendingDoses = await queryRunner.manager.find(Dose, {
                    where: { userId: user.id, status: DoseStatus.PENDING },
                });

                dbEndTimer(); // kết thúc đo

                const existingMap = new Map(existingPendingDoses.map((d) => [d.external_id, d]));

                const dosesToCreate = dosesToSave.filter((d) => !existingMap.has(d.external_id!));
                const dosesToDelete = existingPendingDoses.filter((d) => !newDosesMap.has(d.external_id));

                if (dosesToDelete.length > 0) {
                    const dbEndDelete = this.dbQueryDurationHistogram.startTimer({
                        [MetricLabel.QUERY_TYPE]: "DELETE",
                        [MetricLabel.TABLE_NAME]: "dose",
                    });

                    const idsToDelete = dosesToDelete.map((d) => d.id);
                    await queryRunner.manager.delete(Dose, { id: In(idsToDelete) });

                    dbEndDelete();

                    deleted = idsToDelete.length;
                    this.dosesDeletedCounter.inc(
                        { [MetricLabel.SYNC_TYPE]: "future_only", [MetricLabel.STATUS]: "success" },
                        deleted,
                    );
                    this.logger.log(`Deleted ${deleted} obsolete pending doses for user ${user.id}`);
                }

                if (dosesToCreate.length > 0) {
                    const dbEndInsert = this.dbQueryDurationHistogram.startTimer({
                        [MetricLabel.QUERY_TYPE]: "INSERT",
                        [MetricLabel.TABLE_NAME]: "dose",
                    });

                    await queryRunner.manager.save(Dose, dosesToCreate);

                    dbEndInsert();

                    created = dosesToCreate.length;
                    this.dosesSyncedCounter.inc(
                        { [MetricLabel.SYNC_TYPE]: "future_only", [MetricLabel.STATUS]: "success" },
                        created,
                    );
                    this.logger.log(`Created ${created} new doses for user ${user.id}`);
                }

                await queryRunner.commitTransaction();
            } catch (error) {
                await queryRunner.rollbackTransaction();
                this.logger.error(`[DosesSyncService] Transaction failed for user ${user.id}`, error.stack);

                this.dosesSyncedCounter.inc({ [MetricLabel.SYNC_TYPE]: "future_only", [MetricLabel.STATUS]: "error" });
                this.dosesDeletedCounter.inc({ [MetricLabel.SYNC_TYPE]: "future_only", [MetricLabel.STATUS]: "error" });

                throw error;
            } finally {
                await queryRunner.release();
            }

            const upcomingDoses = dosesToSave.filter((d) => d.status === DoseStatus.UPCOMING);
            if (upcomingDoses.length > 0) {
                await this.notificationClient.scheduleNotifications(
                    upcomingDoses.map((d) => ({ id: d.id!, userId: d.userId!, notify_at: d.notify_at! })),
                );

                notificationsScheduled = upcomingDoses.length;
                this.notificationsScheduledCounter.inc(
                    { [MetricLabel.SYNC_TYPE]: "future_only", [MetricLabel.STATUS]: "success" },
                    notificationsScheduled,
                );
            }

            return { created, deleted, notificationsScheduled };
        } catch (error) {
            this.logger.error(`[DosesSyncService] syncDosesInFuture failed for user ${user.id}`, error.stack);

            this.notificationsScheduledCounter.inc({ [MetricLabel.SYNC_TYPE]: "future_only", [MetricLabel.STATUS]: "error" });
            throw error;
        } finally {
            endTimer();
        }
    }

    public async syncAllDosesByUserId(userId: string, hospitalUrl: string): Promise<SyncResult> {
        const endTimer = this.syncDurationHistogram.startTimer({
            [MetricLabel.SYNC_TYPE]: "full_history",
        });

        let created = 0;
        let deleted = 0;
        let notificationsScheduled = 0;

        try {
            if (!hospitalUrl) throw new Error("hospitalUrl is required.");

            let user: UserPayload | null = null;
            try {
                user = await this.accountClient.fetchUserById(userId);
            } catch (error) {
                this.logger.error(
                    `[DosesSyncService] Failed to fetch user. userId=${userId} hospitalUrl=${hospitalUrl}`,
                    error.stack,
                );
                throw error;
            }

            if (!user) {
                this.logger.warn(`[DosesSyncService] User not found. userId=${userId} hospitalUrl=${hospitalUrl}`);
                return { created: 0, deleted: 0, notificationsScheduled: 0 };
            }
            if (!user.phoneNumber) {
                this.logger.warn(`[DosesSyncService] User has no phone number. userId=${userId}`);
                return { created: 0, deleted: 0, notificationsScheduled: 0 };
            }

            this.logger.log(`[DosesSyncService] Starting full history sync for user=${userId} phone=${user?.phoneNumber}`);

            let allYlenhthuoc: YLenhThuoc[];
            try {
                allYlenhthuoc = await this.hospitalClient.fetchYLenhThuoc(user.phoneNumber, hospitalUrl);
            } catch (error) {
                this.logger.error(`[DosesSyncService] Failed to fetch treatment data for user=${userId}`, error.stack);
                throw error;
            }

            if (!allYlenhthuoc || allYlenhthuoc.length === 0) {
                this.logger.log(`[DosesSyncService] No treatment records from hospital for user=${userId}`);
                return { created: 0, deleted: 0, notificationsScheduled: 0 };
            }

            const allDosesToCreate = new Map<string, Partial<Dose>>();

            for (const ylenh of allYlenhthuoc) {
                if (!ylenh.tenthuoc || !ylenh.thoidiem) continue;

                const startDate = moment.tz(ylenh.ngay, "DD/MM/YYYY", "Asia/Ho_Chi_Minh");
                let numberOfDays = parseInt(ylenh.songay, 10);

                if (isNaN(numberOfDays) || numberOfDays <= 0) {
                    numberOfDays = estimateDaysFromLieudungAndSoluong(ylenh.lieudung, ylenh.soluong) ?? 0;
                }
                if (numberOfDays <= 0) continue;

                for (let i = 0; i < numberOfDays; i++) {
                    const currentDate = startDate.clone().add(i, "days");
                    const dueAt = moment.tz(
                        `${currentDate.format("DD/MM/YYYY")} ${ylenh.thoidiem}`,
                        "DD/MM/YYYY HH:mm",
                        "Asia/Ho_Chi_Minh",
                    );

                    const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format("YYYYMMDDHHmm")}`;
                    if (allDosesToCreate.has(externalId)) continue;

                    const mealRelation: MealRelation | null = (() => {
                        switch (ylenh.thuchien) {
                            case "Trước ăn": return { type: "BEFORE", minutes: 30 };
                            case "Sau ăn": return { type: "AFTER", minutes: 0 };
                            case "Trong bữa ăn": return { type: "WITH", minutes: 0 };
                            default: return null;
                        }
                    })();

                    allDosesToCreate.set(externalId, {
                        external_id: externalId,
                        userId: userId,
                        due_at: dueAt.toDate(),
                        notify_at: dueAt.clone().subtract(15, "minutes").toDate(),
                        status: dueAt.isBefore(moment()) ? DoseStatus.MISSED : DoseStatus.UPCOMING,
                        ylenh_id: ylenh.id,
                        ylenh_stt: ylenh.stt,
                        medication_name: ylenh.tenthuoc,
                        dosage_instructions: ylenh.lieudung,
                        usage_instructions: ylenh.thuchien,
                        meal_relation: mealRelation,
                    });
                }
            }

            if (allDosesToCreate.size === 0) {
                this.logger.log(`[DosesSyncService] No valid doses to create for user=${userId}`);
                return { created: 0, deleted: 0, notificationsScheduled: 0 };
            }

            const dosesToSave = Array.from(allDosesToCreate.values());
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                // DELETE toàn bộ liều cũ
                const dbEndDelete = this.dbQueryDurationHistogram.startTimer({
                    [MetricLabel.QUERY_TYPE]: "DELETE",
                    [MetricLabel.TABLE_NAME]: "dose",
                });
                const deleteResult = await queryRunner.manager.delete(Dose, { userId: userId });
                dbEndDelete();

                deleted = deleteResult.affected ?? 0;
                if (deleted > 0) {
                    this.dosesDeletedCounter.inc(
                        { [MetricLabel.SYNC_TYPE]: "full_history", [MetricLabel.STATUS]: "success" },
                        deleted,
                    );
                }
                this.logger.log(`[DosesSyncService] Deleted ${deleted} old doses for user=${userId}`);

                // INSERT liều mới theo chunks
                const dbEndInsert = this.dbQueryDurationHistogram.startTimer({
                    [MetricLabel.QUERY_TYPE]: "INSERT",
                    [MetricLabel.TABLE_NAME]: "dose",
                });
                for (let i = 0; i < dosesToSave.length; i += 100) {
                    const chunk = dosesToSave.slice(i, i + 100);
                    await queryRunner.manager.save(Dose, chunk);
                }
                dbEndInsert();

                created = dosesToSave.length;
                this.dosesSyncedCounter.inc(
                    { [MetricLabel.SYNC_TYPE]: "full_history", [MetricLabel.STATUS]: "success" },
                    created,
                );
                this.logger.log(`[DosesSyncService] Created ${created} new doses for user=${userId}`);

                await queryRunner.commitTransaction();
            } catch (error) {
                await queryRunner.rollbackTransaction();

                this.logger.error(`[DosesSyncService] Transaction failed for user=${userId}`, error.stack);
                this.dosesSyncedCounter.inc({ [MetricLabel.SYNC_TYPE]: "full_history", [MetricLabel.STATUS]: "error" });
                this.dosesDeletedCounter.inc({ [MetricLabel.SYNC_TYPE]: "full_history", [MetricLabel.STATUS]: "error" });

                throw error;
            } finally {
                await queryRunner.release();
            }

            const upcomingDoses = dosesToSave.filter(d => d.status === DoseStatus.UPCOMING);
            if (upcomingDoses.length > 0) {
                await this.notificationClient.scheduleNotifications(
                    upcomingDoses.map(d => ({ id: d.id!, userId: d.userId!, notify_at: d.notify_at! })),
                );

                notificationsScheduled = upcomingDoses.length;
                this.notificationsScheduledCounter.inc(
                    { [MetricLabel.SYNC_TYPE]: "full_history", [MetricLabel.STATUS]: "success" },
                    notificationsScheduled,
                );
                this.logger.log(`[DosesSyncService] Scheduled ${notificationsScheduled} notifications for user=${userId}`);
            }

            return { created, deleted, notificationsScheduled };
        } catch (error) {
            this.logger.error(`[DosesSyncService] syncAllDoses failed for user=${userId}`, error.stack);
            this.notificationsScheduledCounter.inc({ [MetricLabel.SYNC_TYPE]: "full_history", [MetricLabel.STATUS]: "error" });
            throw error;
        } finally {
            endTimer();
        }
    }
}

function estimateDaysFromLieudungAndSoluong(lieudung: string, soluong: string): number | null {
    if (!lieudung || !soluong) return null;

    // Tìm số lần/ngày
    const timesPerDayMatch = lieudung.match(/ngày\s+(\d+)\s+lần/i);
    const timesPerDay = timesPerDayMatch ? parseInt(timesPerDayMatch[1], 10) : 1;

    // Tìm số viên/lần (có thể là số thập phân)
    const unitsPerTimeMatch = lieudung.match(/lần\s+([\d.,]+)\s*viên/i);
    const unitsPerTime = unitsPerTimeMatch ? parseFloat(unitsPerTimeMatch[1].replace(',', '.')) : 1;

    const totalUnits = parseFloat(soluong.replace(',', '.'));
    if (!timesPerDay || !unitsPerTime || !totalUnits) return null;

    const estimatedDays = totalUnits / (timesPerDay * unitsPerTime);
    return estimatedDays > 0 ? Math.round(estimatedDays) : null;
}
