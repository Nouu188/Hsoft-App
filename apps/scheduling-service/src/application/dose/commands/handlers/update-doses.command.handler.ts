import { BadRequestException, Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Dose, DoseStatus, IDoseRepository } from "apps/scheduling-service/src/domain";
import { DoseTransactionService } from "apps/scheduling-service/src/infrastructure";
import { UpdateDosesCommand } from "../impl/update-doses.command";

@CommandHandler(UpdateDosesCommand)
export class UpdateDosesCommandHandler
    implements ICommandHandler<UpdateDosesCommand, Dose[]> {
    private readonly logger = new Logger(UpdateDosesCommandHandler.name);

    constructor(
        private readonly transactionService: DoseTransactionService,
        @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository,
    ) { }

    async execute(command: UpdateDosesCommand): Promise<Dose[]> {
        const { userId, input } = command;

        this.logger.log(`Received UpdateDosesCommand for userId=${userId}`);

        if (!input || input.length === 0) {
            this.logger.warn(`No update data provided for userId=${userId}`);
            throw new BadRequestException("No update data provided.");
        }

        return this.transactionService.execute(async (manager) => {
            const doseIds = input.map((u) => u.id);
            this.logger.debug(
                `Attempting to update doses [${doseIds.join(", ")}] for userId=${userId}`,
            );

            const dosesToUpdate = await this.doseRepo.findByIdsAndUser(doseIds, userId, manager);

            if (dosesToUpdate.length !== doseIds.length) {
                this.logger.error(
                    `Dose ownership validation failed. Requested=${doseIds.length}, Found=${dosesToUpdate.length}`,
                );
                throw new UnauthorizedException(
                    "You are trying to update doses that do not exist or you do not own.",
                );
            }

            for (const dose of dosesToUpdate) {
                const updateInput = input.find((u) => u.id === dose.id);
                if (!updateInput) continue;

                const updateData = { ...updateInput.data };

                if (updateData.due_at) {
                    updateData.due_at = new Date(updateData.due_at);
                }

                Object.assign(dose, updateData);

                switch (updateData.status) {
                    case DoseStatus.TAKEN:
                        dose.taken_at = new Date();
                        dose.skipReasonCategory = null;
                        dose.skipReasonDetail = null;
                        break;
                    case DoseStatus.SKIPPED:
                        dose.taken_at = undefined;
                        break;
                    default:
                        dose.skipReasonCategory = null;
                        dose.skipReasonDetail = null;
                        break;
                }

                this.logger.verbose(
                    `Prepared update for Dose(id=${dose.id}, status=${dose.status})`,
                );
            }

            const saved = await this.doseRepo.save(dosesToUpdate, manager);

            this.logger.log(
                `Successfully updated ${saved.length} doses for userId=${userId}`,
            );

            return saved;
        });
    }
}
