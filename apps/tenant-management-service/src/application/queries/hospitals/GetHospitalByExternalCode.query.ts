import { IQuery } from "@nestjs/cqrs";

export class GetHospitalByExternalCodeQuery implements IQuery {
    constructor(public readonly externalCode: string) {}
}