import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "apps/account-service/src/domain/users/interfaces";
import { Inject, Logger } from "@nestjs/common";
import { AccountTransactionService } from "apps/account-service/src/infrastructure/common/services";
import { User } from "apps/account-service/src/domain/users/entities";
import { FcmTokenRegisterationCommand } from "../FcmTokenRegisteration.command";

@CommandHandler(FcmTokenRegisterationCommand)
export class FcmTokenRegisterationHandler implements ICommandHandler<FcmTokenRegisterationCommand> {
    private readonly logger = new Logger(FcmTokenRegisterationHandler.name);

    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        private readonly transactionService: AccountTransactionService,
    ) { }

    async execute(command: FcmTokenRegisterationCommand): Promise<Boolean> {
        return this.transactionService.execute(async (manager) => {
            const { userId, deviceToken } = command;

            return this.transactionService.execute(async (manager) => {
                return this.userRepository.updateDeviceTokenByUserId(userId, deviceToken, manager);
            })
        })
    }
}