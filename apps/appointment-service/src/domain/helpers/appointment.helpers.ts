import { EntityManager, Between } from 'typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Appointment, AppointmentStatus, AppointmentType } from '../entities';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Ho_Chi_Minh';

export async function calculateQueueNumber(
    manager: EntityManager,
    clinicId: string,
    appointmentDate: dayjs.Dayjs
): Promise<number> {
    const startOfDay = appointmentDate.startOf('day').toDate();
    const endOfDay = appointmentDate.endOf('day').toDate();

    const countForDay = await manager.count(Appointment, {
        where: { clinicId, appointmentTime: Between(startOfDay, endOfDay) },
    });

    return countForDay + 1;
}

export function isIdentityComplete(identity: any): boolean {
    return !!identity.fullName && !!identity.dob && !!identity.gender && !!identity.phoneNumber;
}

export function formatAppointmentDate(inputDate: string): dayjs.Dayjs {
    return dayjs(inputDate).tz(TZ);
}

export async function createAppointmentEntity(
    manager: EntityManager,
    identity: any,
    input: any,
    type: AppointmentType,
    queueNumber?: number
): Promise<Appointment> {
    const appointmentDate = formatAppointmentDate(input.appointmentTime);

    const newAppointment = manager.create(Appointment, {
        userId: identity.userId,
        appointmentType: type,
        clinicId: input.clinicId || null,
        doctorId: input.doctorId || null,
        appointmentTime: appointmentDate.toDate(),
        queueNumber: queueNumber || 1,
        patientName: identity.fullName,
        patientPhone: identity.phoneNumber,
        patientGender: identity.gender,
        birthYear: identity.birthYear,
        notes: input.notes,
        status: AppointmentStatus.PENDING,
    });

    return manager.save(newAppointment);
}
