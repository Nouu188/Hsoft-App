import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { NotificationApiClientService } from '@app/api-clients/notification/notification-api-client.service';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { UserPayload } from 'apps/account-service/src/users/dto/user.payload';
import { Dose, DoseStatus, MealRelation } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import * as moment from 'moment-timezone';
import { Counter } from 'prom-client';
import { DataSource, In, Repository } from 'typeorm';
import { YLenhThuoc } from '../../../../../libs/common/src/types/ylenhthuoc.interface';

interface SyncResult {
    created: number;
    deleted: number;
    notificationsScheduled: number;
}

@Injectable()
export class DosesSyncService {
    private readonly logger = new Logger(DosesSyncService.name);

    constructor(
        @InjectRepository(Dose) private doseRepository: Repository<Dose>,
        private readonly hospitalClient: HospitalApiClientService,
        private readonly notificationClient: NotificationApiClientService,
        private readonly tenantApiClient: TenantApiClientService,
        private readonly dataSource: DataSource,
        @InjectMetric(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL) private readonly notificationsScheduledCounter: Counter<string>,
    ) { }

    public async syncDosesInFuture(user: UserPayload, ngay: string = ""): Promise<SyncResult> {
        const today = moment().tz('Asia/Ho_Chi_Minh');
        const phoneNumber = user.phoneNumber;
        if (!phoneNumber) throw new Error('User phoneNumber is required.');

        let ylenhthuoc: YLenhThuoc[];
        try {
            ylenhthuoc = await this.hospitalClient.fetchYLenhThuoc(phoneNumber, ngay);
        } catch (error) {
            this.logger.error(`Failed to get y lenh thuoc for user ${user.id}: ${error.message}`);
            throw error;
        }

        if (!ylenhthuoc || ylenhthuoc.length === 0) {
            this.logger.log(`No treatments found for user ${user.id} on ${today.format('DD/MM/YYYY')}.`);
            return { created: 0, deleted: 0, notificationsScheduled: 0 };
        }

        const newDosesMap = new Map<string, Partial<Dose>>();

        // Prepare new doses
        for (const ylenh of ylenhthuoc) {
            if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.songay) continue;

            const startDate = moment.tz(ylenh.ngay, 'DD/MM/YYYY', 'Asia/Ho_Chi_Minh');
            const numberOfDays = parseInt(ylenh.songay, 10);
            if (isNaN(numberOfDays) || numberOfDays <= 0) continue;

            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = startDate.clone().add(i, 'days');
                const dueAt = moment.tz(`${currentDate.format('DD/MM/YYYY')} ${ylenh.thoidiem}`, 'DD/MM/YYYY HH:mm', 'Asia/Ho_Chi_Minh');
                if (dueAt.isBefore(today)) continue;

                const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format('YYYYMMDDHHmm')}`;
                if (newDosesMap.has(externalId)) continue;

                const mealRelation: MealRelation | null = (() => {
                    switch (ylenh.thuchien) {
                        case 'Trước ăn': return { type: 'BEFORE', minutes: 30 };
                        case 'Sau ăn': return { type: 'AFTER', minutes: 0 };
                        case 'Trong bữa ăn': return { type: 'WITH', minutes: 0 };
                        default: return null;
                    }
                })();

                newDosesMap.set(externalId, {
                    external_id: externalId,
                    userId: user.id,
                    due_at: dueAt.toDate(),
                    notify_at: dueAt.clone().subtract(15, 'minutes').toDate(),
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

        let created = 0;
        let deleted = 0;
        try {
            // Fetch existing pending doses
            const existingPendingDoses = await queryRunner.manager.find(Dose, {
                where: { userId: user.id, status: DoseStatus.PENDING },
            });
            const existingMap = new Map(existingPendingDoses.map(d => [d.external_id, d]));

            const dosesToCreate = dosesToSave.filter(d => !existingMap.has(d.external_id!));
            const dosesToDelete = existingPendingDoses.filter(d => !newDosesMap.has(d.external_id));

            // Delete old doses
            if (dosesToDelete.length > 0) {
                const idsToDelete = dosesToDelete.map(d => d.id);
                await queryRunner.manager.delete(Dose, { id: In(idsToDelete) });
                deleted = idsToDelete.length;
                this.logger.log(`Deleted ${deleted} obsolete pending doses for user ${user.id}`);
            }

            // Insert new doses
            if (dosesToCreate.length > 0) {
                await queryRunner.manager.save(Dose, dosesToCreate);
                created = dosesToCreate.length;
                this.logger.log(`Created ${created} new doses for user ${user.id}`);
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`[DosesSyncService] Transaction failed for user ${user.id}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }

        // Schedule notifications outside transaction
        const upcomingDoses = dosesToSave.filter(d => d.status === DoseStatus.UPCOMING);
        if (upcomingDoses.length > 0) {
            const notificationsToSchedule = upcomingDoses.map(d => ({ id: d.id!, userId: d.userId!, notify_at: d.notify_at! }));
            await this.notificationClient.scheduleNotifications(notificationsToSchedule);
            this.notificationsScheduledCounter.inc(
                { [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'success' },
                notificationsToSchedule.length,
            );
        }

        return { created, deleted, notificationsScheduled: upcomingDoses.length };
    }

    public async syncAllDoses(user: UserPayload, hospitalUrl: string): Promise<SyncResult> {
        const phoneNumber = user.phoneNumber;
        if (!phoneNumber) throw new Error('User phoneNumber is required.');
        if (!hospitalUrl) throw new Error('hospitalUrl is required.');

        this.logger.log(`[DosesSyncService] Starting full history sync for user ${user.id} (${phoneNumber})...`);

        let allYlenhthuoc: YLenhThuoc[];
        try {
            allYlenhthuoc = await this.hospitalClient.fetchYLenhThuoc(phoneNumber, hospitalUrl);
        } catch (error) {
            this.logger.error(`[DosesSyncService] Failed to fetch treatment data`, error.stack);
            throw error;
        }

        if (!allYlenhthuoc || allYlenhthuoc.length === 0) {
            this.logger.log(`[DosesSyncService] No doses found from hospital for user ${user.id}`);
            return { created: 0, deleted: 0, notificationsScheduled: 0 };
        }

        const allDosesToCreate = new Map<string, Partial<Dose>>();

        for (const ylenh of allYlenhthuoc) {
            if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.songay) continue;

            const startDate = moment.tz(ylenh.ngay, 'DD/MM/YYYY', 'Asia/Ho_Chi_Minh');

            const rawDays = parseInt(ylenh.songay, 10);

            let numberOfDays: number | null = null;
            if (!isNaN(rawDays) && rawDays > 0) {
                numberOfDays = rawDays;
            } else {
                numberOfDays = estimateDaysFromLieudungAndSoluong(ylenh.lieudung, ylenh.soluong);
            }

            if (!numberOfDays || numberOfDays <= 0) {
                this.logger.debug(`[DosesSyncService] Skip ylenh=${ylenh.id} vì không xác định được số ngày từ songay/soluong/lieudung`);
                continue;
            }

            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = startDate.clone().add(i, 'days');
                const dueAt = moment.tz(`${currentDate.format('DD/MM/YYYY')} ${ylenh.thoidiem}`, 'DD/MM/YYYY HH:mm', 'Asia/Ho_Chi_Minh');

                const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format('YYYYMMDDHHmm')}`;
                if (allDosesToCreate.has(externalId)) continue;

                const mealRelation: MealRelation | null = (() => {
                    switch (ylenh.thuchien) {
                        case 'Trước ăn': return { type: 'BEFORE', minutes: 30 };
                        case 'Sau ăn': return { type: 'AFTER', minutes: 0 };
                        case 'Trong bữa ăn': return { type: 'WITH', minutes: 0 };
                        default: return null;
                    }
                })();

                allDosesToCreate.set(externalId, {
                    external_id: externalId,
                    userId: user.id,
                    due_at: dueAt.toDate(),
                    notify_at: dueAt.clone().subtract(15, 'minutes').toDate(),
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
            this.logger.log(`[DosesSyncService] No valid doses to create for user ${user.id}`);
            return { created: 0, deleted: 0, notificationsScheduled: 0 };
        }

        const dosesToSave = Array.from(allDosesToCreate.values());
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Xóa toàn bộ liều cũ
            await queryRunner.manager.delete(Dose, { userId: user.id });
            this.logger.log(`[DosesSyncService] Cleared all previous doses for user ${user.id}`);

            // Lưu liều mới theo chunk 100
            for (let i = 0; i < dosesToSave.length; i += 100) {
                const chunk = dosesToSave.slice(i, i + 100);
                await queryRunner.manager.save(Dose, chunk);
            }

            await queryRunner.commitTransaction();
            this.logger.log(`[DosesSyncService] Created ${dosesToSave.length} doses for user ${user.id}`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`[DosesSyncService] Transaction failed for user ${user.id}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }

        // Schedule notifications sau commit
        const upcomingDoses = dosesToSave.filter(d => d.status === DoseStatus.UPCOMING);
        if (upcomingDoses.length > 0) {
            await this.notificationClient.scheduleNotifications(
                upcomingDoses.map(d => ({ id: d.id!, userId: d.userId!, notify_at: d.notify_at! })),
            );
        }

        this.notificationsScheduledCounter.inc(
            { [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'success' },
            upcomingDoses.length,
        );

        return { created: dosesToSave.length, deleted: 0, notificationsScheduled: upcomingDoses.length };
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
