import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { Dose, DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { NotificationApiClientService } from '@app/api-clients/notification/notification-api-client.service';

interface YLenhThuoc {
    id: string;
    stt: string;
    ngay: string; 
    sott: string;
    tenthuoc: string;
    thuchien: string;
    soluong: string;
    songay: string;
    lieudung: string; 
    thoidiem: string; 
}

@Injectable()
export class TreatmentSyncService {
    private readonly logger = new Logger(TreatmentSyncService.name);

    constructor(
        @InjectRepository(Dose) private doseRepository: Repository<Dose>,
        private readonly hospitalClient: HospitalApiClientService,
        private readonly notificationClient: NotificationApiClientService,
    ) {}

    public async syncUserTreatments(user: User, ngay: string): Promise<void> {
        const today = moment().tz('Asia/Ho_Chi_Minh');
        const todayString = today.format('DD/MM/YYYY');

        let ylenhthuoc: YLenhThuoc[];
        try {
            ylenhthuoc = await this.hospitalClient.fetchYLenhThuoc(user, ngay)
        } catch (error) {
            this.logger.error(`Failed to get treatment data for user ${user.id}. Error: ${error.message}`);
            throw error; 
        }

        if (ylenhthuoc.length === 0) {
            this.logger.log(`No treatments found for user ${user.id} on ${todayString}.`);
            return;
        }

        const allDosesToCreate: Partial<Dose>[] = [];

        for (const ylenh of ylenhthuoc) {
            if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.soluong || !ylenh.songay) {
                continue;
            }

            const startDate = moment.tz(ylenh.ngay, 'DD/MM/YYYY', 'Asia/Ho_Chi_Minh');
            const numberOfDays = parseInt(ylenh.ngay, 10);
            const timeOfDay = ylenh.thoidiem; 

            if (isNaN(numberOfDays) || numberOfDays <= 0) {
                continue;
            }

            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = startDate.clone().add(i, 'days');
                const dueAt = moment.tz(`${currentDate.format('DD/MM/YYYY')} ${timeOfDay}`, 'DD/MM/YYYY HH:mm', 'Asia/Ho_Chi_Minh');

                if (dueAt.isAfter(moment())) {
                    allDosesToCreate.push({
                        ylenh_id: ylenh.id,
                        ylenh_stt: ylenh.stt,
                        user_id: user.id,
                        due_at: dueAt.toDate(),
                        notify_at: dueAt.clone().subtract(15, 'minutes').toDate(), 
                        status: DoseStatus.PENDING,
                        medication_name: ylenh.tenthuoc,
                        dosage_instructions: ylenh.lieudung,
                        usage_instructions: ylenh.thuchien,
                    });
                }
            }
        }

        if (allDosesToCreate.length === 0) {
            this.logger.log(`No new future doses to create for user ${user.id}.`);
            return;
        }

        await this.doseRepository
            .createQueryBuilder()
            .delete()
            .from(Dose)
            .where("user_id = :user_id", { user_id: user.id })
            .andWhere("status = :status", { status: DoseStatus.PENDING })
            .andWhere("due_at > :now", { now: new Date() })
            .execute();
        
        this.logger.log(`Deleted all future pending doses for user ${user.id} before syncing.`);

        const savedDoses = await this.doseRepository.save(allDosesToCreate);
        this.logger.log(`Created ${savedDoses.length} new doses for user ${user.id}.`);

        await this.notificationClient.scheduleNotifications(savedDoses.map(dose => ({
            id: dose.id,
            user_id: dose.user_id,
            notify_at: dose.notify_at,
        })))
    }
}