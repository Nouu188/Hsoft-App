import { Logger } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class JobsResolver {
    private readonly logger = new Logger(JobsResolver.name);

    constructor() {}

    @Query(() => String, { name: 'pingSchedulingService' })
    ping(): string {
        return 'Pong from Scheduling Service!';
    }
}