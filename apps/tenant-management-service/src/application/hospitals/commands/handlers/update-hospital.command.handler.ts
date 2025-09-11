import { BadRequestException, Inject, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Hospital } from "apps/tenant-management-service/src/domain/hospitals/entities";
import { IHospitalRepository } from "apps/tenant-management-service/src/domain/hospitals/interfaces";
import { HospitalTransactionService } from "apps/tenant-management-service/src/infrastructure/common/services/transaction.service";
import { UpdateHospitalCommand } from "../impl";

@CommandHandler(UpdateHospitalCommand)
export class UpdateHospitalHandler implements ICommandHandler<UpdateHospitalCommand, Hospital> {
    private readonly logger = new Logger(UpdateHospitalHandler.name);

    constructor(
        @Inject(IHospitalRepository)
        private readonly hospitalRepo: IHospitalRepository,
        private readonly transactionService: HospitalTransactionService,
    ) { }

    async execute(command: UpdateHospitalCommand): Promise<Hospital> {
        const { input } = command;

        if (!input?.id) {
            this.logger.error(`Update failed: missing hospital id`);
            throw new BadRequestException("Hospital id is required");
        }

        this.logger.log(`Received UpdateHospitalCommand for hospital id=${input.id}`);

        try {
            return await this.transactionService.execute(async (manager) => {
                const existingHospital = await this.hospitalRepo.findById(input.id);
                if (!existingHospital) {
                    this.logger.warn(`Hospital with id=${input.id} not found`);
                    throw new NotFoundException(`Hospital with id=${input.id} not found`);
                }

                this.logger.debug(`Updating hospital with id=${input.id} using input=${JSON.stringify(input)}`);
                const updatedHospital = await this.hospitalRepo.updateOne(input, manager);

                this.logger.log(`Hospital with id=${input.id} updated successfully`);
                return updatedHospital;
            });
        } catch (error) {
            this.logger.error(
                `Failed to update hospital with id=${input.id}, error=${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException("Failed to update hospital");
        }
    }
}
