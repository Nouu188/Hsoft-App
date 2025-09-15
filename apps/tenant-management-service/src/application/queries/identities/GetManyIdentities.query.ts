import { IQuery } from "@nestjs/cqrs";

export class GetManyIdentitiesQuery implements IQuery {
    constructor(public readonly ids: string[]) {}
}