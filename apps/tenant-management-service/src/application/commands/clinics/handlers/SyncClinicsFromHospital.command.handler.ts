import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Clinic, IClinicRepository } from 'apps/tenant-management-service/src/domain';
import { SyncClinicsFromHospitalCommand } from '../SyncClinicsFromHospital.command';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { GetHospitalByExternalCodeQuery } from '../../../queries';
import { InjectDataSource } from '@nestjs/typeorm';

@CommandHandler(SyncClinicsFromHospitalCommand)
export class SyncClinicsFromHospitalHandler
  implements ICommandHandler<SyncClinicsFromHospitalCommand, { syncedCount: number }>
{
  private readonly logger = new Logger(SyncClinicsFromHospitalHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly hospitalApiClient: HospitalApiClientService,
    @Inject(IClinicRepository) private readonly clinicRepo: IClinicRepository,
    @InjectDataSource('tenantConnection') private readonly dataSource: DataSource,
  ) {}

  async execute(command: SyncClinicsFromHospitalCommand): Promise<{ syncedCount: number }> {
    const { externalHospitalCode } = command;
    this.logger.log(`🔄 Starting clinic sync for hospital code: ${externalHospitalCode}`);

    // 1. Lấy thông tin bệnh viện
    const hospital = await this.queryBus.execute(new GetHospitalByExternalCodeQuery(externalHospitalCode));
    if (!hospital) {
      this.logger.error(`❌ Hospital with externalCode=${externalHospitalCode} not found`);
      throw new Error(`Hospital with externalCode=${externalHospitalCode} not found`);
    }
    this.logger.debug(`✅ Found hospital: ${hospital.name} (ID: ${hospital.id})`);

    // 2. Fetch dữ liệu từ API
    const fetchedClinics = await this.hospitalApiClient.fetchClinics(hospital.graphqlEndpoint);
    this.logger.log(`📥 Fetched ${fetchedClinics.length} clinics from hospital API`);

    if (!fetchedClinics || fetchedClinics.length === 0) {
      this.logger.warn('⚠️ No clinics found to sync.');
      return { syncedCount: 0 };
    }

    // 3. Chuẩn bị dữ liệu
    const clinicsToUpsert: Partial<Clinic>[] = fetchedClinics.map(clinicDto => ({
      hospitalId: hospital.id,
      externalCode: clinicDto.makp?.trim(), // chuẩn hóa dữ liệu
      name: clinicDto.tenkp?.trim(),
      isActive: true,
    }));

    // 4. Transaction để đảm bảo atomicity
    try {
      const result = await this.dataSource.transaction(async manager => {
        // nếu repo có hỗ trợ truyền manager
        return await this.clinicRepo.upsert(clinicsToUpsert);
      });

      this.logger.log(`✅ Successfully upserted ${result.length} clinics into DB.`);
      return { syncedCount: result.length };
    } catch (error) {
      this.logger.error(
        `❌ Failed to sync clinics for hospital ${externalHospitalCode}. Reason: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
