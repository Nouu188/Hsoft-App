import {
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import {
    CommandHandler,
    ICommandHandler,
} from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Identity, IHospitalRepository, IIdentityRepository } from 'apps/tenant-management-service/src/domain';
import { CreateIdentityCommand } from '../CreateIdentity.command';

@CommandHandler(CreateIdentityCommand)
export class CreateIdentityHandler implements ICommandHandler<CreateIdentityCommand> {
    private readonly logger = new Logger(CreateIdentityHandler.name);

    constructor(
        @InjectDataSource('tenantConnection')
        private readonly dataSource: DataSource,
        @Inject(IIdentityRepository)
        private readonly identityRepo: IIdentityRepository,
        @Inject(IHospitalRepository)
        private readonly hospitalRepo: IHospitalRepository,
    ) { }

    async execute(command: CreateIdentityCommand): Promise<Identity> {
        const { identity, userId, externalHospitalCode } = command;

        this.logger.debug(
            `[CreateIdentityHandler] Creating/updating Identity for userId=${userId}, phone=${identity.phoneNumber}`,
        );

        const cleanPayload = {
            ...identity,
            phoneNumber: identity.phoneNumber?.trim(),
            nationalId: identity.nationalId?.trim(),
            fullName: identity.fullName?.trim() || 'Unknown',
            hospitals: identity.hospitals ?? [],
        };

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let identity = await this.identityRepo.findByUserId(userId);

            if (externalHospitalCode) {
                const hospital = await this.hospitalRepo.findByExternalCode(externalHospitalCode);
                if (!hospital) {
                    throw new NotFoundException(
                        `Hospital not found with code ${externalHospitalCode}`,
                    );
                }

                const exists = cleanPayload.hospitals.some((h) => h.id === hospital.id);
                if (!exists) {
                    cleanPayload.hospitals.push(hospital);
                }
            }

            if (identity) {
                Object.assign(identity, cleanPayload);
                this.logger.debug(`[CreateIdentityHandler] Updating existing Identity id=${identity.id}`);
            } else {
                identity = await this.identityRepo.create({
                    ...cleanPayload,
                    userId,
                });
                this.logger.debug(`[CreateIdentityHandler] Creating new Identity for userId=${userId}`);
            }

            const saved = await this.identityRepo.save(identity, queryRunner.manager);

            await queryRunner.commitTransaction();

            this.logger.log(
                `[CreateIdentityHandler] Successfully saved Identity id=${saved.id} for userId=${userId}`,
            );

            return saved;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(
                `[CreateIdentityHandler] Failed to save Identity for userId=${userId}. Error: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Failed to save Identity');
        } finally {
            await queryRunner.release();
        }
    }
}
