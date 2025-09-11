import { IQuery } from "@nestjs/cqrs";

export class GetDoctorByIdQuery implements IQuery {
    constructor ( 
        public readonly doctorId: string
    ) { }
}