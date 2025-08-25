import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { NotificationApiClientService } from '@app/api-clients/notification/notification-api-client.service';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';
import { TrackBusinessMetric } from '@app/common/metrics/decorators/track-business-metric.decorator';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { Dose, DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import * as moment from 'moment-timezone';
import { Counter } from 'prom-client';
import { In, Repository } from 'typeorm';
import { YLenhThuoc } from '../../doses/dto/ylenhthuoc.payload';

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

        @InjectMetric(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL)
        private readonly notificationsScheduledCounter: Counter<string>,
    ) { }

    // Trường "ngay" là ngày đi khám của bệnh nhân, cũng như ngày bắt đầu uống thuốc 
    @TrackBusinessMetric(MetricName.DOSES_SYNCED_TOTAL, {
        labels: (args, result, error) => ({
            [MetricLabel.SYNC_TYPE]: 'future_only',
            [MetricLabel.STATUS]: error ? 'error' : 'success',
        }),
        value: (args, result: SyncResult) => result.created,
    })
    public async syncDosesInFuture(user: User, ngay: string = ""): Promise<SyncResult> {
        const today = moment().tz('Asia/Ho_Chi_Minh');
        const todayString = today.format('DD/MM/YYYY');

        let ylenhthuoc: YLenhThuoc[];
        try {
            ylenhthuoc = await this.hospitalClient.fetchYLenhThuoc(user, ngay);
        } catch (error) {
            this.logger.error(`Failed to get y lenh thuoc for user ${user.id}. Error: ${error.message}`);
            throw error;
        }

        if (ylenhthuoc.length === 0) {
            this.logger.log(`No treatments found for user ${user.id} on ${todayString}.`);
            return { created: 0, deleted: 0, notificationsScheduled: 0 };
        }

        const newDosesMap = new Map<string, Partial<Dose>>();

        for (const ylenh of ylenhthuoc) {
            if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.songay) continue;

            const startDate = moment.tz(ylenh.ngay, 'DD/MM/YYYY', 'Asia/Ho_Chi_Minh');
            const numberOfDays = parseInt(ylenh.songay, 10);
            if (isNaN(numberOfDays) || numberOfDays <= 0) continue;

            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = startDate.clone().add(i, 'days');
                const dueAt = moment.tz(`${currentDate.format('DD/MM/YYYY')} ${ylenh.thoidiem}`, 'DD/MM/YYYY HH:mm', 'Asia/Ho_Chi_Minh');

                if (dueAt.isAfter(moment())) {
                    // Tạo khóa định danh duy nhất
                    const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format('YYYYMMDDHHmm')}`;

                    const doseData: Partial<Dose> = {
                        external_id: externalId,
                        ylenh_id: ylenh.id,
                        ylenh_stt: ylenh.stt,
                        userId: user.id,
                        due_at: dueAt.toDate(),
                        notify_at: dueAt.clone().subtract(15, 'minutes').toDate(),
                        status: DoseStatus.UPCOMING,
                        medication_name: ylenh.tenthuoc,
                        dosage_instructions: ylenh.lieudung,
                        usage_instructions: ylenh.thuchien,
                        meal_relation: ylenh.thuchien === 'Trước ăn'
                            ? { type: 'BEFORE', minutes: 30 }
                            : ylenh.thuchien === 'Sau ăn'
                                ? { type: 'AFTER', minutes: 0 }
                                : ylenh.thuchien === 'Trong bữa ăn'
                                    ? { type: 'WITH', minutes: 0 }
                                    : null,
                    };
                    newDosesMap.set(externalId, doseData);
                }
            }
        }

        const existingPendingDoses = await this.doseRepository.find({
            where: {
                userId: user.id,
                status: DoseStatus.PENDING,
            },
        });
        const existingDosesMap = new Map(existingPendingDoses.map(d => [d.external_id, d]));

        // SO SÁNH (DIFF) ĐỂ TÌM RA THAY ĐỔI 
        const dosesToCreate = Array.from(newDosesMap.values())
            .filter(newDose => !existingDosesMap.has(newDose.external_id!));

        const dosesToDelete = existingPendingDoses
            .filter(existingDose => !newDosesMap.has(existingDose.external_id));

        if (dosesToDelete.length > 0) {
            const idsToDelete = dosesToDelete.map(d => d.id);
            await this.doseRepository.delete({ id: In(idsToDelete) });
            this.logger.log(`Deleted ${idsToDelete.length} obsolete pending doses for user ${user.id}.`);
        }

        let notificationsScheduled = 0;
        if (dosesToCreate.length > 0) {
            const savedDoses = await this.doseRepository.save(dosesToCreate);
            this.logger.log(`Created ${savedDoses.length} new doses for user ${user.id}.`);

            const notificationsToSchedule = savedDoses.flatMap(dose => [
                { id: dose.id, userId: dose.userId, notify_at: dose.notify_at },
                { id: dose.id, userId: dose.userId, notify_at: dose.due_at }
            ]);

            await this.notificationClient.scheduleNotifications(notificationsToSchedule);
            notificationsScheduled = notificationsToSchedule.length;

            this.notificationsScheduledCounter.inc({ [MetricLabel.SYNC_TYPE]: 'future_only', [MetricLabel.STATUS]: 'success' }, notificationsScheduled);
        }

        if (dosesToCreate.length === 0 && dosesToDelete.length === 0) {
            this.logger.log(`No changes in schedule for user ${user.id}. Sync complete.`);
        }

        return { created: dosesToCreate.length, deleted: dosesToDelete.length, notificationsScheduled };
    }

    @TrackBusinessMetric(MetricName.DOSES_SYNCED_TOTAL, {
        labels: (args, result, error) => ({
            [MetricLabel.SYNC_TYPE]: 'full_history',
            [MetricLabel.STATUS]: error ? 'error' : 'success',
        }),
        value: (args, result: SyncResult) => result.created,
    })
    public async syncAllDoses(user: User): Promise<SyncResult> {
        this.logger.log(`Starting full history sync for user ${user.id}...`);
        let allYlenhthuoc: YLenhThuoc[];
        try {
            allYlenhthuoc = await this.hospitalClient.fetchYLenhThuoc(user);
        } catch (error) {
            this.logger.error(`Failed to fetch ALL treatment data for user ${user.id}.`, error);
            throw error;
        }

        if (allYlenhthuoc.length === 0) {
            this.logger.log(`No doses found in from the hospital for user ${user.id}`);
            return { created: 0, deleted: 0, notificationsScheduled: 0 };
        }

        const allDosesToCreate = new Map<string, Partial<Dose>>();

        for (const ylenh of allYlenhthuoc) {
            if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.songay) continue;

            const startDate = moment.tz(ylenh.ngay, 'DD/MM/YYYY', 'Asia/Ho_Chi_Minh');
            const numberOfDays = parseInt(ylenh.songay, 10);
            if (isNaN(numberOfDays) || numberOfDays <= 0) continue;

            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = startDate.clone().add(i, 'days');
                const dueAt = moment.tz(`${currentDate.format('DD/MM/YYYY')} ${ylenh.thoidiem}`, 'DD/MM/YYYY HH:mm', 'Asia/Ho_Chi_Minh');

                // Không lọc theo isAfter(moment()) nữa vì chúng ta cần cả lịch sử
                const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format('YYYYMMDDHHmm')}`;

                // Dùng Map để tự động loại bỏ các liều trùng lặp nếu API trả về lỗi
                if (!allDosesToCreate.has(externalId)) {
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
                        meal_relation: ylenh.thuchien === 'Trước ăn'
                            ? { type: 'BEFORE', minutes: 30 }
                            : ylenh.thuchien === 'Sau ăn'
                                ? { type: 'AFTER', minutes: 0 }
                                : ylenh.thuchien === 'Trong bữa ăn'
                                    ? { type: 'WITH', minutes: 0 }
                                    : null,
                    });
                }
            }
        }

        if (allDosesToCreate.size === 0) {
            this.logger.log(`No doses to create after processing history for user ${user.id}.`);
            return { created: 0, deleted: 0, notificationsScheduled: 0 };
        }

        // Xóa toàn bộ dữ liệu cũ của user để đảm bảo đồng bộ sạch
        await this.doseRepository.delete({ userId: user.id });
        this.logger.log(`Cleared all previous doses for user ${user.id} before full sync.`);

        const dosesToSaveInChunks = Array.from(allDosesToCreate.values());
        // Lưu theo từng chunk nhỏ để tránh quá tải DB
        for (let i = 0; i < dosesToSaveInChunks.length; i += 100) {
            const chunk = dosesToSaveInChunks.slice(i, i + 100);
            await this.doseRepository.save(chunk);
        }

        this.logger.log(`Created ${dosesToSaveInChunks.length} total doses for user ${user.id}.`);

        // Lên lịch thông báo chỉ cho các liều PENDING
        const futureDoses = dosesToSaveInChunks.filter(d => d.status === DoseStatus.PENDING);
        await this.notificationClient.scheduleNotifications(futureDoses.map(dose => ({
            id: dose.id!,
            userId: dose.userId!,
            notify_at: dose.notify_at!,
        })));

        const notificationsScheduled = futureDoses.length;

        this.notificationsScheduledCounter.inc({ [MetricLabel.SYNC_TYPE]: 'full_history', [MetricLabel.STATUS]: 'success' }, notificationsScheduled);

        return { created: dosesToSaveInChunks.length, deleted: 0, notificationsScheduled };
    }
}