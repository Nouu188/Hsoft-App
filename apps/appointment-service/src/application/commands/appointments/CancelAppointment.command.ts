import { ICommand } from "@nestjs/cqrs";

export class CancelAppointmentCommand implements ICommand {
    constructor (
        public readonly userId: string,
        public readonly appointmentId: string
    ) { }
}