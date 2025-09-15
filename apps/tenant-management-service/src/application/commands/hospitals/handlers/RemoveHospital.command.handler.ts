import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { HospitalTransactionService } from "apps/tenant-management-service/src/infrastructure/common/services/transaction.service";
import { IHospitalRepository } from "apps/tenant-management-service/src/domain";
import { RemoveHospitalCommand } from "../RemoveHospital.command";

@CommandHandler(RemoveHospitalCommand)
export class RemoveHospitalHandler implements ICommandHandler<RemoveHospitalCommand, boolean> {
    private readonly logger = new Logger(RemoveHospitalHandler.name);

    constructor(
        @Inject(IHospitalRepository)
        private readonly hospitalRepo: IHospitalRepository,
        private readonly transactionService: HospitalTransactionService,
    ) { }

    async execute(command: RemoveHospitalCommand): Promise<boolean> {
        const { id } = command;
        this.logger.log(`Received RemoveHospitalCommand for hospital id=${id}`);

        try {
            return await this.transactionService.execute(async (manager) => {
                const hospital = await this.hospitalRepo.findById(id);

                if (!hospital) {
                    this.logger.warn(`Hospital with id=${id} not found`);
                    throw new NotFoundException(`Hospital with id=${id} not found`);
                }

                this.logger.debug(`Removing hospital with id=${id} in transaction`);
                await this.hospitalRepo.removeOne(id, manager);

                this.logger.log(`Hospital with id=${id} removed successfully`);
                return true;
            });
        } catch (error) {
            this.logger.error(
                `Failed to remove hospital with id=${id}, error=${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException("Failed to remove hospital");
        }
    }
}
