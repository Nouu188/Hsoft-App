import { Injectable } from '@nestjs/common';
import { YLenhThuoc } from '@app/common/types';
import * as moment from 'moment-timezone';
import { Dose, DoseStatus, MealRelation } from '../entities';
import { estimateDaysFromLieudungAndSoluong } from '../helpers/doses/estimate-dose-days.helper';

@Injectable()
export class DoseSchedulerService {
    public buildDosesFromYLenh(userId: string, ylenhthuoc: YLenhThuoc[]): Dose[] {
        const today = moment().tz("Asia/Ho_Chi_Minh");
        const newDosesMap = new Map<string, Partial<Dose>>();

        for (const ylenh of ylenhthuoc) {
            if (!ylenh.tenthuoc || !ylenh.thoidiem || !ylenh.songay) continue;

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
                if (dueAt.isBefore(today)) continue;

                const externalId = `${ylenh.id}-${ylenh.stt}-${dueAt.format("YYYYMMDDHHmm")}`;
                if (newDosesMap.has(externalId)) continue;

                const mealRelation: MealRelation | null = (() => {
                    switch (ylenh.thuchien) {
                        case "Trước ăn": return { type: "BEFORE", minutes: 30 };
                        case "Sau ăn": return { type: "AFTER", minutes: 0 };
                        case "Trong bữa ăn": return { type: "WITH", minutes: 0 };
                        default: return null;
                    }
                })();

                newDosesMap.set(externalId, {
                    external_id: externalId,
                    userId,
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

        return Array.from(newDosesMap.values()) as Dose[];
    }

    public groupUpcomingDosesForNotification(doses: Dose[]) {
        const upcomingDoses = doses.filter(d => d.status === DoseStatus.UPCOMING);
        const notificationsToSchedule = new Map<string, { userId: string; doseIds: string[]; notifyAt: Date }>();

        for (const dose of upcomingDoses) {
            const notifyAtTimestamp = new Date(dose.notify_at!).getTime();
            const key = `${dose.userId}@${notifyAtTimestamp}`;
            if (!notificationsToSchedule.has(key)) {
                notificationsToSchedule.set(key, { userId: dose.userId!, doseIds: [], notifyAt: dose.notify_at! });
            }
            notificationsToSchedule.get(key)!.doseIds.push(dose.id!);
        }

        return { upcomingDoses, notificationsToSchedule };
    }
}
