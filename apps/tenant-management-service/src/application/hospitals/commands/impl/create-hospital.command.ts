import { ICommand } from "@nestjs/cqrs";
import { CreateHospitalInput } from "apps/tenant-management-service/src/domain/hospitals/dtos";

export class CreateHospitalCommand implements ICommand {
    constructor(
        public readonly input: CreateHospitalInput
    ) { }
}