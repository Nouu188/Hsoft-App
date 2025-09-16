import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { Clinic, Doctor, IDoctorRepository, MedicalService } from 'apps/tenant-management-service/src/domain';
import { IMedicalServiceRepository } from 'apps/tenant-management-service/src/domain/interfaces/medical-service';
import { NormalizedDoctorDataDto } from 'libs/normalizers/src/lib/doctor.normalizer';
import { DataSource, In } from 'typeorm';
import { GetHospitalByExternalCodeQuery } from '../../../queries';
import { SyncDoctorsFromHospitalCommand } from '../SyncDoctorsFromHospital.command';

@CommandHandler(SyncDoctorsFromHospitalCommand)
export class SyncDoctorsFromHospitalHandler implements ICommandHandler<SyncDoctorsFromHospitalCommand, { syncedDoctors: number; syncedServices: number }> {
    private readonly logger = new Logger(SyncDoctorsFromHospitalHandler.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly hospitalApiClient: HospitalApiClientService,
        @Inject(IDoctorRepository) private readonly doctorRepo: IDoctorRepository,
        @Inject(IMedicalServiceRepository) private readonly serviceRepo: IMedicalServiceRepository,
        @InjectDataSource('tenantConnection') private readonly dataSource: DataSource, // Inject DataSource
    ) { }

    async execute(command: SyncDoctorsFromHospitalCommand): Promise<{ syncedDoctors: number; syncedServices: number }> {
        const { externalHospitalCode, date } = command;
        this.logger.log(`Starting doctor sync for hospital code: ${externalHospitalCode} on date: ${date}`);

        // 1. Lấy thông tin bệnh viện
        const hospital = await this.queryBus.execute(new GetHospitalByExternalCodeQuery(externalHospitalCode));
        this.logger.debug(`Found hospital: ${hospital.name}, endpoint: ${hospital.graphqlEndpoint}`);

        // 2. Fetch dữ liệu thô từ API bệnh viện
        const normalizedData = await this.hospitalApiClient.fetchDoctors(
            hospital.graphqlEndpoint, undefined, undefined, date,
        );
        this.logger.log(`Fetched data for ${normalizedData.length} unique doctors from hospital API.`);
        if (normalizedData.length === 0) {
            return { syncedDoctors: 0, syncedServices: 0 };
        }

        // 3. (MỚI) Tạo map ánh xạ từ mã phòng khám bên ngoài sang ID nội bộ
        const clinicMapping = await this.createClinicMapping(hospital.id, normalizedData);

        // 4. Tách và chuẩn bị dữ liệu với clinicId đã được ánh xạ đúng
        const { doctorsToUpsert, servicesToUpsert } = this.prepareDataForSync(normalizedData, clinicMapping);

        // 5. Thực hiện lưu vào CSDL trong một transaction
        return this.dataSource.transaction(async (manager) => {
            this.logger.log(`Transaction started. Upserting ${servicesToUpsert.length} services and ${doctorsToUpsert.length} doctors.`);

            // Upsert services
            if (servicesToUpsert.length > 0) {
                await manager.getRepository(MedicalService).upsert(servicesToUpsert, ['id']);
            }

            // Upsert doctors (không có quan hệ)
            const doctorEntities = doctorsToUpsert.map(({ services, ...doc }) => doc);
            if (doctorEntities.length > 0) {
                await manager.getRepository(Doctor).upsert(doctorEntities, ['externalCode']);
            }

            // Lấy lại các doctors vừa được lưu để có ID nội bộ
            const savedDoctors = await manager.getRepository(Doctor).find({
                where: { externalCode: In(doctorsToUpsert.map(d => d.externalCode!)) }
            });

            // Tạo các mối quan hệ ManyToMany
            for (const doctor of savedDoctors) {
                const originalData = doctorsToUpsert.find(d => d.externalCode === doctor.externalCode);
                if (originalData && originalData.services) {
                    doctor.services = originalData.services.map(s => ({ id: s.id })) as MedicalService[];
                }
            }
            await manager.getRepository(Doctor).save(savedDoctors);

            this.logger.log('Doctor and service sync transaction committed successfully.');
            return {
                syncedDoctors: doctorsToUpsert.length,
                syncedServices: servicesToUpsert.length,
            };
        }).catch(error => {
            this.logger.error('Doctor sync transaction rolled back due to an error.', error.stack);
            throw error;
        });
    }

    private async createClinicMapping(hospitalId: string, normalizedData: NormalizedDoctorDataDto[]): Promise<Map<string, string>> {
        // Trích xuất tất cả các mã phòng khám duy nhất từ dữ liệu fetch về
        const externalClinicCodes = [...new Set(normalizedData.map(d => d.externalClinicCode))];
        this.logger.debug(`Found ${externalClinicCodes.length} unique external clinic codes to map.`);

        // Tìm tất cả các phòng khám đã có trong CSDL của chúng ta
        const existingClinics = await this.dataSource.getRepository(Clinic).find({
            where: { hospitalId, externalCode: In(externalClinicCodes) }
        });

        const mapping = new Map<string, string>();
        for (const clinic of existingClinics) {
            mapping.set(clinic.externalCode, clinic.id);
        }

        this.logger.log(`Successfully mapped ${mapping.size} of ${externalClinicCodes.length} clinic codes.`);
        return mapping;
    }

    private prepareDataForSync(normalizedData: NormalizedDoctorDataDto[], clinicMapping: Map<string, string>) {
        const servicesMap = new Map<string, Partial<MedicalService>>();
        const doctorsToUpsert: (Partial<Doctor> & { services: { id: string }[] })[] = [];

        for (const docData of normalizedData) {
            const internalClinicId = clinicMapping.get(docData.externalClinicCode);
            if (!internalClinicId) {
                this.logger.warn(`Skipping doctor ${docData.externalCode} (${docData.name}) because their clinic (${docData.externalClinicCode}) has not been synced yet.`);
                continue;
            }

            for (const serviceData of docData.services) {
                if (!servicesMap.has(serviceData.id)) {
                    servicesMap.set(serviceData.id, {
                        id: serviceData.id,
                        name: serviceData.name,
                        prices: serviceData.prices,
                        isHealthInsuranceApplied: serviceData.isHealthInsuranceApplied,
                        rawData: serviceData.rawData,
                    });
                }
            }

            doctorsToUpsert.push({
                externalCode: docData.externalCode,
                name: docData.name,
                gender: docData.gender,
                avatarUrl: docData.avatarUrl,
                experience: docData.experience,
                announcement: docData.announcement,
                pinCode: docData.pinCode,
                clinicId: internalClinicId, 
                isActive: true,
                services: docData.services.map(s => ({
                    id: s.id,
                    name: s.name,
                    prices: s.prices,
                    isHealthInsuranceApplied: s.isHealthInsuranceApplied,
                    rawData: s.rawData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
            });
        }

        return {
            doctorsToUpsert,
            servicesToUpsert: Array.from(servicesMap.values()),
        };
    }
}