import { ICommand } from "@nestjs/cqrs";
import { HospitalClinicInput } from "apps/tenant-management-service/src/domain";

export class UpsertClinicsCommand implements ICommand {
    constructor(
        public readonly inputs: HospitalClinicInput[],
    ) { }
}