import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { HospitalClinicDto } from './dto/hospital-clinic.dto';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    @InjectRepository(Clinic, 'appointmentConnection') 
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async findAllActive(): Promise<Clinic[]> {
    this.logger.debug('Fetching all active clinics from the database.');
    return this.clinicRepository.find({ 
      where: { isActive: true }, 
      order: { name: 'ASC' } 
    });
  }

  async upsertClinics(hospitalClinics: HospitalClinicDto[]): Promise<{ created: number, updated: number, deactivated: number }> {
    this.logger.log(`Starting upsert process for ${hospitalClinics.length} hospital clinics.`);
    
    try {
      const allDbClinics = await this.clinicRepository.find();
      const dbClinicsMap = new Map(allDbClinics.map(c => [c.externalMakp, c]));
      const hospitalClinicsMap = new Map(hospitalClinics.map(c => [c.makp, c]));

      const clinicsToUpdate: Clinic[] = [];
      const clinicsToCreate: Partial<Clinic>[] = [];

      for (const [makp, hospitalClinic] of hospitalClinicsMap.entries()) {
        const existingClinic = dbClinicsMap.get(makp);

        if (existingClinic) {
          if (existingClinic.name !== hospitalClinic.tenkp || !existingClinic.isActive) {
            existingClinic.name = hospitalClinic.tenkp;
            existingClinic.isActive = true; 
            clinicsToUpdate.push(existingClinic);
          }
        } else {
          clinicsToCreate.push({
            externalMakp: hospitalClinic.makp,
            name: hospitalClinic.tenkp,
            isActive: true,
          });
        }
      }

      const clinicsToDeactivate = allDbClinics.filter(
        dbClinic => dbClinic.isActive && !hospitalClinicsMap.has(dbClinic.externalMakp)
      );

      const recordsToSave = [...clinicsToCreate, ...clinicsToUpdate];
      if (recordsToSave.length > 0) {
        await this.clinicRepository.save(recordsToSave);
        this.logger.log(`Created ${clinicsToCreate.length} and updated ${clinicsToUpdate.length} clinics.`);
      }

      if (clinicsToDeactivate.length > 0) {
        const idsToDeactivate = clinicsToDeactivate.map(c => c.id);
        await this.clinicRepository.update(idsToDeactivate, { isActive: false });
        this.logger.log(`Deactivated ${clinicsToDeactivate.length} clinics.`);
      }

      if (recordsToSave.length === 0 && clinicsToDeactivate.length === 0) {
        this.logger.log('No changes detected for clinics. Sync complete.');
      }

      return { 
        created: clinicsToCreate.length, 
        updated: clinicsToUpdate.length,
        deactivated: clinicsToDeactivate.length,
      };

    } catch (error) {
      this.logger.error('An error occurred during the clinic upsert process.', error.stack);
      throw new InternalServerErrorException('Failed to synchronize clinic data.');
    }
  }
}