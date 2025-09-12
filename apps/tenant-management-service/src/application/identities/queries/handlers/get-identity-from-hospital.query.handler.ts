import { Inject, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { v4 as uuidv4 } from "uuid";
import { HospitalApiClientService } from "@app/api-clients/hospital/hospital-api.service";
import { IdentityTransactionService } from "apps/tenant-management-service/src/infrastructure/common/services/transaction.service";
import { GetIdentityFromHospitalQuery } from "../impl/get-identity-from-hospital.query";
import { Identity, IHospitalRepository, IIdentityRepository } from "apps/tenant-management-service/src/domain";

@QueryHandler(GetIdentityFromHospitalQuery)
export class GetIdentityFromHospitalHandler implements IQueryHandler<GetIdentityFromHospitalQuery, Identity | null> {
    private readonly logger = new Logger(GetIdentityFromHospitalHandler.name);

    constructor(
        @Inject(IIdentityRepository) private readonly identityRepository: IIdentityRepository,
        @Inject(IHospitalRepository) private readonly hospitalRepo: IHospitalRepository,
        private readonly hospitalApiClient: HospitalApiClientService,
        private readonly transactionService: IdentityTransactionService,
    ) { }

    async execute(query: GetIdentityFromHospitalQuery): Promise<Identity | null> {
        const { phoneNumber, externalHospitalCode } = query;
        this.logger.debug(`[GetIdentityFromHospitalHandler] Start fetch for phone=${phoneNumber}, code=${externalHospitalCode}`);

        try {
            const hospital = await this.hospitalRepo.findByExternalCode(externalHospitalCode);
            if (!hospital) {
                this.logger.error(`[GetIdentityFromHospitalHandler] Hospital not found for code=${externalHospitalCode}`);
                throw new NotFoundException(`Hospital code not found: ${externalHospitalCode}`);
            }

            const hospitalUrl = hospital.graphqlEndpoint;

            const patient = await this.hospitalApiClient.fetchIdentityFromHospital(
                phoneNumber,
                hospitalUrl,
                hospital.plainExternalCode,
            );

            if (!patient) {
                this.logger.warn(`[GetIdentityFromHospitalHandler] No patient found for code=${externalHospitalCode}, phone=${phoneNumber}`);
                return null;
            }

            this.logger.debug(`[GetIdentityFromHospitalHandler] Found patient externalPatientCode=${patient.externalPatientCode}, name=${patient.fullName}`);

            const identity = this.transactionService.execute(async (manager) => {
                const newIdentity = await this.identityRepository.create({
                    id: uuidv4(),
                    phoneNumber: patient.phoneNumber,
                    externalPatientCode: patient.externalPatientCode,
                    fullName: patient.fullName,
                    address: patient.address,
                    gender: patient.gender,
                    avatarUrl: patient.avatarUrl,
                    healthInsuranceNumber: patient.healthInsuranceNumber,
                    nationalId: patient.nationalId,
                    birthYear: Number(patient.birthYear),
                    hospitals: [],
                });

                return this.identityRepository.save(newIdentity, manager);
            });

            return identity;
        } catch (error) {
            this.logger.error(
                `[GetIdentityFromHospitalHandler] Error fetching identity for phone=${phoneNumber}, code=${externalHospitalCode}`,
                error.stack || error,
            );
            throw new InternalServerErrorException(`Unable to fetch patient info from hospital`);
        }
    }
}
