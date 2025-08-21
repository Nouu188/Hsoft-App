// apps/appointment-service/src/doctors/doctors.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { DoctorAvailability, TimeSlot } from './dto/doctor-availability.object-type';
import { HospitalDoctorDto } from './dto/hospital-doctor.dto';
import { Clinic } from '../clinics/entities/clinic.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Clinic) // Inject Clinic repository để tìm clinicId
    private readonly clinicRepository: Repository<Clinic>,
    private readonly hospitalClient: HospitalApiClientService,
  ) {}

  /**
   * Lấy danh sách bác sĩ, có thể lọc theo ID phòng khám.
   */
  async findAll(clinicId?: string): Promise<Doctor[]> {
    this.logger.debug(`Fetching doctors. Clinic ID: ${clinicId || 'All'}`);
    return this.doctorRepository.find({
      where: { 
        isActive: true,
        ...(clinicId && { clinicId }), // Thêm điều kiện lọc nếu có
      },
      relations: ['clinic'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Tìm một bác sĩ bằng ID.
   */
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

  /**
   * Lấy lịch làm việc của một bác sĩ trong một ngày cụ thể.
   */
  async getDoctorAvailability(doctorId: string, date: string): Promise<DoctorAvailability> {
    this.logger.debug(`Fetching availability for doctor ${doctorId} on date ${date}`);
    
    // Logic giả lập - Trong thực tế, bạn sẽ gọi Hospital API
    const timeSlots: TimeSlot[] = [];
    for (let hour = 8; hour < 17; hour++) {
      if (hour === 12) continue; // Giờ nghỉ trưa
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

  /**
   * Cập nhật hoặc tạo mới (Upsert) danh sách bác sĩ từ dữ liệu của bệnh viện.
   */
  async upsertDoctors(hospitalDoctors: HospitalDoctorDto[]): Promise<{ created: number, updated: number, deactivated: number }> {
    this.logger.log(`Starting upsert process for ${hospitalDoctors.length} doctors.`);
    if (hospitalDoctors.length === 0) return { created: 0, updated: 0, deactivated: 0 };

    const externalMabsList = hospitalDoctors.map(d => d.mabs);
    const externalMakpList = [...new Set(hospitalDoctors.map(d => d.makp))];

    // Lấy dữ liệu cần thiết từ DB trong một vài lần gọi
    const [allDbDoctors, clinics] = await Promise.all([
      this.doctorRepository.find(),
      this.clinicRepository.find({ where: { externalMakp: In(externalMakpList) } }),
    ]);

    const dbDoctorsMap = new Map(allDbDoctors.map(d => [d.externalMabs, d]));
    const clinicsMap = new Map(clinics.map(c => [c.externalMakp, c.id]));

    const doctorsToCreate: Partial<Doctor>[] = [];
    const doctorsToUpdate: Doctor[] = [];

    for (const hd of hospitalDoctors) {
      const clinicId = clinicsMap.get(hd.makp);
      if (!clinicId) {
        this.logger.warn(`Skipping doctor ${hd.tenbs} (mabs: ${hd.mabs}) because their clinic (makp: ${hd.makp}) was not found in our DB.`);
        continue;
      }

      const existingDoctor = dbDoctorsMap.get(hd.mabs);
      if (existingDoctor) {
        // Cập nhật nếu có thay đổi
        if (existingDoctor.name !== hd.tenbs || !existingDoctor.isActive) {
          existingDoctor.name = hd.tenbs;
          existingDoctor.clinicId = clinicId;
          existingDoctor.isActive = true;
          doctorsToUpdate.push(existingDoctor);
        }
      } else {
        // Tạo mới
        doctorsToCreate.push({
          externalMabs: hd.mabs,
          name: hd.tenbs,
          clinicId: clinicId,
          isActive: true,
        });
      }
    }

    const doctorsToDeactivate = allDbDoctors.filter(
      dbDoctor => dbDoctor.isActive && !externalMabsList.includes(dbDoctor.externalMabs)
    );

    // Thực thi các thao tác CSDL
    const recordsToSave = [...doctorsToCreate, ...doctorsToUpdate];
    if (recordsToSave.length > 0) {
      await this.doctorRepository.save(recordsToSave);
    }
    if (doctorsToDeactivate.length > 0) {
      await this.doctorRepository.update(doctorsToDeactivate.map(d => d.id), { isActive: false });
    }

    return {
      created: doctorsToCreate.length,
      updated: doctorsToUpdate.length,
      deactivated: doctorsToDeactivate.length,
    };
  }
}