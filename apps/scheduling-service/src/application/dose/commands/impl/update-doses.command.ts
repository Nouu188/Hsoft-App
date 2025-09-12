import { ICommand } from "@nestjs/cqrs";
import { UpdateDoseInput } from "apps/scheduling-service/src/domain";

export class UpdateDosesCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly input: UpdateDoseInput[],
    ) {}
}