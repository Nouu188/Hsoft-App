import { IQuery } from "@nestjs/cqrs";

export class GetIdentityByIdQuery implements IQuery {
    constructor(public readonly id: string) {}
}