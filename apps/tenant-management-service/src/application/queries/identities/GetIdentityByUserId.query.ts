import { IQuery } from "@nestjs/cqrs";

export class GetIdentityByUserIdQuery implements IQuery {
    constructor(public readonly userId: string) {}
}