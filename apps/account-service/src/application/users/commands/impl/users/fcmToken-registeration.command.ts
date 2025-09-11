import { DeviceToken } from "apps/account-service/src/domain/users/entities";

export class FcmTokenRegisterationCommand {
    constructor(
        public readonly userId: string,
        public readonly deviceToken: DeviceToken
    ) { }
}