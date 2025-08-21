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

  /**
   * Lấy tất cả các phòng khám đang hoạt động, được sắp xếp theo tên.
   * @returns Mảng các phòng khám.
   */
  async findAllActive(): Promise<Clinic[]> {
    this.logger.debug('Fetching all active clinics from the database.');
    return this.clinicRepository.find({ 
      where: { isActive: true }, 
      order: { name: 'ASC' } 
    });
  }

  /**
   * Cập nhật hoặc tạo mới (Upsert) danh sách phòng khám từ dữ liệu của bệnh viện.
   * Logic này so sánh dữ liệu mới với dữ liệu hiện có để giảm thiểu các thao tác ghi vào DB.
   * @param hospitalClinics Dữ liệu phòng khám thô từ API bệnh viện.
   * @returns Số lượng bản ghi đã tạo, cập nhật, và vô hiệu hóa.
   */
  async upsertClinics(hospitalClinics: HospitalClinicDto[]): Promise<{ created: number, updated: number, deactivated: number }> {
    this.logger.log(`Starting upsert process for ${hospitalClinics.length} hospital clinics.`);
    
    try {
      // 1. Lấy TOÀN BỘ phòng khám hiện có trong DB một lần duy nhất
      const allDbClinics = await this.clinicRepository.find();
      const dbClinicsMap = new Map(allDbClinics.map(c => [c.externalMakp, c]));
      const hospitalClinicsMap = new Map(hospitalClinics.map(c => [c.makp, c]));

      const clinicsToUpdate: Clinic[] = [];
      const clinicsToCreate: Partial<Clinic>[] = [];

      // 2. Lặp qua dữ liệu từ bệnh viện để tìm các bản ghi cần TẠO MỚI hoặc CẬP NHẬT
      for (const [makp, hospitalClinic] of hospitalClinicsMap.entries()) {
        const existingClinic = dbClinicsMap.get(makp);

        if (existingClinic) {
          // Đã tồn tại -> Kiểm tra xem có cần cập nhật không
          if (existingClinic.name !== hospitalClinic.tenkp || !existingClinic.isActive) {
            existingClinic.name = hospitalClinic.tenkp;
            existingClinic.isActive = true; // Kích hoạt lại nếu cần
            clinicsToUpdate.push(existingClinic);
          }
        } else {
          // Chưa tồn tại -> Tạo mới
          clinicsToCreate.push({
            externalMakp: hospitalClinic.makp,
            name: hospitalClinic.tenkp,
            isActive: true,
          });
        }
      }

      // 3. Lặp qua dữ liệu từ DB để tìm các bản ghi cần VÔ HIỆU HÓA
      const clinicsToDeactivate = allDbClinics.filter(
        dbClinic => dbClinic.isActive && !hospitalClinicsMap.has(dbClinic.externalMakp)
      );

      // 4. Thực thi các thao tác CSDL trong các transaction (nếu có thể)
      // TypeORM's `save` có thể xử lý cả tạo mới và cập nhật trong một lần gọi
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