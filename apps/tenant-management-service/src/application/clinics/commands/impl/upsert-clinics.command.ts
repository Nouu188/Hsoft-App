import { ICommand } from "@nestjs/cqrs";
import { HospitalClinicInput } from "apps/tenant-management-service/src/domain/clinics/dtos";

export class UpsertClinicsCommand implements ICommand {
    constructor(
        public readonly inputs: HospitalClinicInput[],
    ) { }
}