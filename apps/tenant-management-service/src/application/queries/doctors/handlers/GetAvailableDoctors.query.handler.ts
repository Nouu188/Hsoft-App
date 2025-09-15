import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { DoctorAvailability, TimeSlot } from "apps/tenant-management-service/src/domain";
import { Logger } from "@nestjs/common";
import dayjs from "dayjs";
import { GetAvailableDoctorsQuery } from "../GetAvailableDoctors.query";

@QueryHandler(GetAvailableDoctorsQuery)
export class GetAvailableDoctorsHandler implements IQueryHandler<GetAvailableDoctorsQuery, DoctorAvailability> {
    private readonly logger = new Logger(GetAvailableDoctorsHandler.name);

    constructor(

    ) { }

    async execute(query: GetAvailableDoctorsQuery): Promise<DoctorAvailability> {
        const { doctorId, date } = query.input;
        this.logger.debug(`Fetching availability for doctor ${doctorId} on date ${date}`);

        // Giả lập (sau này sẽ gọi hospital API)
        const timeSlots: TimeSlot[] = [];
        for (let hour = 8; hour < 17; hour++) {
            if (hour === 12) continue; // nghỉ trưa
            timeSlots.push({
                startTime: dayjs(date).hour(hour).minute(0).toDate(),
                endTime: dayjs(date).hour(hour).minute(30).toDate(),
                isAvailable: Math.random() > 0.3,
            });
            timeSlots.push({
                startTime: dayjs(date).hour(hour).minute(30).toDate(),
                endTime: dayjs(date).hour(hour + 1).minute(0).toDate(),
                isAvailable: Math.random() > 0.3,
            });
        }

        return { date, timeSlots };
    }
}