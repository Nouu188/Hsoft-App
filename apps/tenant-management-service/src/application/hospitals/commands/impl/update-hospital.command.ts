import { ICommand } from "@nestjs/cqrs";
import { UpdateHospitalInput } from "apps/tenant-management-service/src/domain";

export class UpdateHospitalCommand implements ICommand {
    constructor (
        public readonly input: UpdateHospitalInput
    ) { }
}