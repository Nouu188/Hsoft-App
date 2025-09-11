import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpsertClinicsCommand } from "../impl";
import { Inject, InternalServerErrorException, Logger } from "@nestjs/common";
import { ClinicTransactionService } from "apps/tenant-management-service/src/infrastructure/common/services/transaction.service";
import { Clinic } from "apps/tenant-management-service/src/domain/clinics/entities";
import { IClinicRepository } from "apps/tenant-management-service/src/domain";

@CommandHandler(UpsertClinicsCommand)
export class UpsertClinicsHandler implements ICommandHandler<UpsertClinicsCommand, { created: number; updated: number; deactivated: number }> {
    private readonly logger = new Logger(UpsertClinicsHandler.name);

    constructor(
        @Inject(IClinicRepository) private readonly clinicRepo: IClinicRepository,
        private readonly transactionService: ClinicTransactionService,
    ) { }

    async execute(command: UpsertClinicsCommand): Promise<{ created: number; updated: number; deactivated: number; }> {
        const { inputs } = command;
        
        this.logger.log(
            `Starting upsert process for ${inputs.length} hospital clinics.`,
        );

        if (inputs.length === 0) {
            return { created: 0, updated: 0, deactivated: 0 };
        }

        try {
            return this.transactionService.execute(async (manager) => {
                const allDbClinics = await this.clinicRepo.findAll();
                const dbClinicsMap = new Map(allDbClinics.map((c) => [c.externalCode, c]));
                const hospitalClinicsMap = new Map(
                    inputs.map((c) => [c.makp, c]),
                );

                const clinicsToUpdate: Clinic[] = [];
                const clinicsToCreate: Partial<Clinic>[] = [];

                for (const [makp, hospitalClinic] of hospitalClinicsMap.entries()) {
                    const existingClinic = dbClinicsMap.get(makp);

                    if (existingClinic) {
                        if (
                            existingClinic.name !== hospitalClinic.tenkp ||
                            !existingClinic.isActive
                        ) {
                            existingClinic.name = hospitalClinic.tenkp;
                            existingClinic.isActive = true;
                            clinicsToUpdate.push(existingClinic);
                        }
                    } else {
                        clinicsToCreate.push({
                            externalCode: hospitalClinic.makp,
                            name: hospitalClinic.tenkp,
                            isActive: true,
                        });
                    }
                }

                const clinicsToDeactivate = allDbClinics.filter(
                    (dbClinic) =>
                        dbClinic.isActive && !hospitalClinicsMap.has(dbClinic.externalCode),
                );

                const recordsToSave = [...clinicsToCreate, ...clinicsToUpdate];
                if (recordsToSave.length > 0) {
                    await this.clinicRepo.save(recordsToSave);
                    this.logger.log(
                        `Created ${clinicsToCreate.length} and updated ${clinicsToUpdate.length} clinics.`,
                    );
                }

                if (clinicsToDeactivate.length > 0) {
                    const idsToDeactivate = clinicsToDeactivate.map((c) => c.id);
                    await manager.update(Clinic, idsToDeactivate, { isActive: false });
                    this.logger.log(
                        `Deactivated ${clinicsToDeactivate.length} clinics.`,
                    );
                }

                if (recordsToSave.length === 0 && clinicsToDeactivate.length === 0) {
                    this.logger.log('No changes detected for clinics. Sync complete.');
                }

                return {
                    created: clinicsToCreate.length,
                    updated: clinicsToUpdate.length,
                    deactivated: clinicsToDeactivate.length,
                };
            });
        } catch (error) {
            this.logger.error(
                'An error occurred during the clinic upsert process.',
                error.stack,
            );
            throw new InternalServerErrorException(
                'Failed to synchronize clinic data.',
            );
        }
    }
}