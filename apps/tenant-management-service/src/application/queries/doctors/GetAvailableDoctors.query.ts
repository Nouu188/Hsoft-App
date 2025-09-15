import { IQuery } from "@nestjs/cqrs";
import { DoctorAvailabilityInput } from "apps/tenant-management-service/src/domain";

export class GetAvailableDoctorsQuery implements IQuery {
    constructor(
        public readonly input: DoctorAvailabilityInput
    ) { }
}