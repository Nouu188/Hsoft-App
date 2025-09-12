import { BadRequestException, Inject, InternalServerErrorException, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Hospital, IHospitalRepository } from "apps/tenant-management-service/src/domain";
import { HospitalTransactionService } from "apps/tenant-management-service/src/infrastructure/common/services/transaction.service";
import { CreateHospitalCommand } from "../impl";

@CommandHandler(CreateHospitalCommand)
export class CreateHospitalHandler implements ICommandHandler<CreateHospitalCommand, Hospital> {
    private readonly logger = new Logger(CreateHospitalHandler.name);

    constructor(
        @Inject(IHospitalRepository)
        private readonly hospitalRepository: IHospitalRepository,
        private readonly transactionService: HospitalTransactionService,
    ) { }

    async execute(command: CreateHospitalCommand): Promise<Hospital> {
        const { input } = command;
        this.logger.log(`Received CreateHospitalCommand for hospital: ${input.name}`);

        if (!input?.name) {
            this.logger.error(`Hospital name is missing`);
            throw new BadRequestException("Hospital name is required");
        }

        try {
            return await this.transactionService.execute(async (manager) => {
                this.logger.debug(`Creating hospital in transaction with data: ${JSON.stringify(input)}`);
                const hospital = await this.hospitalRepository.createOne(input, manager);

                this.logger.log(`Hospital created successfully with id=${hospital.id}, name=${hospital.name}`);
                return hospital;
            });
        } catch (error) {
            this.logger.error(
                `Failed to create hospital with name=${input.name}, error=${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException("Failed to create hospital");
        }
    }
}
