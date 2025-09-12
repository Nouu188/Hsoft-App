import { UserPayload } from "apps/account-service/src/domain/users/dtos";

export class SyncDosesInFutureCommand {
    constructor(
        public readonly user: UserPayload,
        public readonly graphqlEndpoint: string,
    ) { }
}
