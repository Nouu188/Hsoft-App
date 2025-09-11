import { ICommand } from "@nestjs/cqrs";
import { CreateIdentityInput } from "apps/tenant-management-service/src/domain/identities/dtos";

export class CreateIdentityCommand implements ICommand {
    constructor(
        public readonly identity: CreateIdentityInput,
        public readonly userId: string,
        public readonly externalHospitalCode?: string,
    ) { }
}
