import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { Dose, DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { NotificationApiClientService } from '@app/api-clients/notification/notification-api-client.service';
import { YLenhThuoc } from '../../doses/dto/ylenhthuoc.payload';

@Injectable()
export class DosesSyncService {
    private readonly logger = new Logger(DosesSyncService.name);

    constructor(
        @InjectRepository(Dose) private doseRepository: Repository<Dose>,
        private readonly hospitalClient: HospitalApiClientService,
        private readonly notificationClient: NotificationApiClientService,
    ) {}

    // Trường "ngay" là ngày đi khám của bệnh nhân, cũng như ngày bắt đầu uống thuốc 
    public async syncDosesForUser(user: User, ngay: string = ""): Promise<void> {
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
            return;
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
                        user_id: user.id,
                        due_at: dueAt.toDate(),
                        notify_at: dueAt.clone().subtract(15, 'minutes').toDate(),
                        status: DoseStatus.PENDING,
                        medication_name: ylenh.tenthuoc,
                        dosage_instructions: ylenh.lieudung,
                        usage_instructions: ylenh.thuchien,
                    };
                    newDosesMap.set(externalId, doseData);
                }
            }
        }

        const existingPendingDoses = await this.doseRepository.find({
            where: {
                user_id: user.id,
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

        if (dosesToCreate.length > 0) {
            const savedDoses = await this.doseRepository.save(dosesToCreate);
            this.logger.log(`Created ${savedDoses.length} new doses for user ${user.id}.`);
            
            // Chỉ lên lịch thông báo cho các liều MỚI được tạo
            await this.notificationClient.scheduleNotifications(savedDoses.map(dose => ({
                id: dose.id,
                user_id: dose.user_id,
                notify_at: dose.notify_at,
            })));

            await this.notificationClient.scheduleNotifications(savedDoses.map(dose => ({
                id: dose.id,
                user_id: dose.user_id,
                notify_at: dose.due_at,
            })))
        }

        if (dosesToCreate.length === 0 && dosesToDelete.length === 0) {
            this.logger.log(`No changes in schedule for user ${user.id}. Sync complete.`);
        }
    }
}