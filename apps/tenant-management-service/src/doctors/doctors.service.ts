import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { DataSource, In, Repository } from 'typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';
import { DoctorAvailability, TimeSlot } from './dto/doctor-availability.object-type';
import { HospitalDoctorDto } from './dto/hospital-doctor.dto';
import { Doctor } from './entities/doctor.entity';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);

  constructor(
    @InjectRepository(Doctor, 'tenantConnection') private readonly doctorRepository: Repository<Doctor>,
    @InjectDataSource('tenantConnection') private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

  async findAll(clinicId?: string): Promise<Doctor[]> {
    this.logger.debug(`Fetching doctors. Clinic ID: ${clinicId || 'All'}`);
    return this.doctorRepository.find({
      where: {
        isActive: true,
        ...(clinicId && { clinicId }),
      },
      relations: ['clinic'],
      order: { name: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id, isActive: true },
      relations: ['clinic'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found.`);
    }
    return doctor;
  }

  async getDoctorAvailability(doctorId: string, date: string): Promise<DoctorAvailability> {
    this.logger.debug(`Fetching availability for doctor ${doctorId} on date ${date}`);

    // Giả lập (sau này sẽ gọi hospital API)
    const timeSlots: TimeSlot[] = [];
    for (let hour = 8; hour < 17; hour++) {
      if (hour === 12) continue; // nghỉ trưa
      timeSlots.push({
        startTime: dayjs(date).hour(hour).minute(0).toDate(),
        endTime: dayjs(date).hour(hour).minute(30).toDate(),
        isAvailable: Math.random() > 0.3,
      });
      timeSlots.push({
        startTime: dayjs(date).hour(hour).minute(30).toDate(),
        endTime: dayjs(date).hour(hour + 1).minute(0).toDate(),
        isAvailable: Math.random() > 0.3,
      });
    }

    return { date, timeSlots };
  }

  // ============================================================
  // MUTATIONS (WRITE - with transaction)
  // ============================================================

  async upsertDoctors(
    hospitalDoctors: HospitalDoctorDto[],
  ): Promise<{ created: number; updated: number; deactivated: number }> {
    this.logger.log(
      `Starting upsert process for ${hospitalDoctors.length} doctors.`,
    );

    if (hospitalDoctors.length === 0) {
      return { created: 0, updated: 0, deactivated: 0 };
    }

    return this.dataSource.transaction(async (manager) => {
      const externalDoctorCodes = hospitalDoctors.map((d) => d.mabs);
      const externalClinicCodes = [
        ...new Set(hospitalDoctors.map((d) => d.makp)),
      ];

      const [allDbDoctors, clinics] = await Promise.all([
        manager.find(Doctor),
        manager.find(Clinic, {
          where: { externalCode: In(externalClinicCodes) },
        }),
      ]);

      const dbDoctorsMap = new Map(allDbDoctors.map((d) => [d.externalCode, d]));
      const clinicsMap = new Map(clinics.map((c) => [c.externalCode, c]));

      const doctorsToCreate: Partial<Doctor>[] = [];
      const doctorsToUpdate: Doctor[] = [];

      for (const hd of hospitalDoctors) {
        const clinic = clinicsMap.get(hd.makp);
        if (!clinic) {
          this.logger.warn(
            `Skipping doctor ${hd.tenbs} (mabs: ${hd.mabs}) because clinic (makp: ${hd.makp}) not found in DB.`,
          );
          continue;
        }

        const existingDoctor = dbDoctorsMap.get(hd.mabs);

        if (existingDoctor) {
          const needsUpdate =
            existingDoctor.name !== hd.tenbs ||
            existingDoctor.clinicId !== clinic.id ||
            !existingDoctor.isActive;

          if (needsUpdate) {
            existingDoctor.name = hd.tenbs;
            existingDoctor.clinic = clinic;
            existingDoctor.isActive = true;
            doctorsToUpdate.push(existingDoctor);
          }
        } else {
          doctorsToCreate.push({
            externalCode: hd.mabs,
            name: hd.tenbs,
            clinic,
            isActive: true,
          });
        }
      }

      const doctorsToDeactivate = allDbDoctors.filter(
        (dbDoctor) =>
          dbDoctor.isActive &&
          !externalDoctorCodes.includes(dbDoctor.externalCode),
      );

      const recordsToSave = [...doctorsToCreate, ...doctorsToUpdate];
      if (recordsToSave.length > 0) {
        await manager.save(Doctor, recordsToSave);
      }

      if (doctorsToDeactivate.length > 0) {
        await manager.update(
          Doctor,
          doctorsToDeactivate.map((d) => d.id),
          { isActive: false },
        );
      }

      return {
        created: doctorsToCreate.length,
        updated: doctorsToUpdate.length,
        deactivated: doctorsToDeactivate.length,
      };
    });
  }
}
