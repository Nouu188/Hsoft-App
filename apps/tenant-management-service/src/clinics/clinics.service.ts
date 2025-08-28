import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { HospitalClinicDto } from './dto/hospital-clinic.dto';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    @InjectRepository(Clinic, 'tenantConnection') private readonly clinicRepository: Repository<Clinic>,
    @InjectDataSource('tenantConnection') private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

  async findAllActive(): Promise<Clinic[]> {
    this.logger.debug('Fetching all active clinics from the database.');
    return this.clinicRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getById(clinicId: string): Promise<Clinic> {
    this.logger.debug(`Fetching clinic with id=${clinicId}`);

    if (!clinicId) {
      this.logger.warn(`getById được gọi nhưng không có clinicId`);
      throw new BadRequestException('Clinic ID is required');
    }

    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
      relations: ['doctors'], // load thêm relation nếu cần
    });

    if (!clinic) {
      this.logger.warn(`Không tìm thấy clinic với id=${clinicId}`);
      throw new NotFoundException(`Clinic with id=${clinicId} not found`);
    }

    this.logger.debug(`Found clinic: ${clinic.name} (${clinic.id})`);
    return clinic;
  }

  // ============================================================
  // MUTATIONS (WRITE - with transaction)
  // ============================================================

  async upsertClinics(
    hospitalClinics: HospitalClinicDto[],
  ): Promise<{ created: number; updated: number; deactivated: number }> {
    this.logger.log(
      `Starting upsert process for ${hospitalClinics.length} hospital clinics.`,
    );

    if (hospitalClinics.length === 0) {
      return { created: 0, updated: 0, deactivated: 0 };
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const allDbClinics = await manager.find(Clinic);
        const dbClinicsMap = new Map(allDbClinics.map((c) => [c.externalCode, c]));
        const hospitalClinicsMap = new Map(
          hospitalClinics.map((c) => [c.makp, c]),
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
          await manager.save(Clinic, recordsToSave);
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
