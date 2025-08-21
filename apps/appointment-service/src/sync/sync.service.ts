// apps/appointment-service/src/sync/sync.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { ClinicsService } from '../clinics/clinics.service';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly hospitalClient: HospitalApiClientService,
    private readonly clinicsService: ClinicsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  /**
   * Cron job chính, chạy hàng ngày để thực hiện tất cả các tác vụ đồng bộ.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'dailyFullSync',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDailySyncCron() {
    this.logger.log('--- Starting Daily Full Synchronization Job ---');
    
    // Chạy các tác vụ đồng bộ một cách tuần tự
    await this.syncClinics();
    await this.syncDoctors();
    
    this.logger.log('--- Daily Full Synchronization Job Finished ---');
  }

  /**
   * Điều phối quá trình đồng bộ hóa danh sách phòng khám.
   */
  async syncClinics(): Promise<void> {
    this.logger.log('[Sync] Starting clinics synchronization...');
    try {
      // 1. Gọi API client để lấy dữ liệu thô từ bệnh viện
      const hospitalClinics = await this.hospitalClient.fetchClinics();
      
      // 2. Ủy thác việc xử lý dữ liệu cho service nghiệp vụ
      const result = await this.clinicsService.upsertClinics(hospitalClinics);
      
      this.logger.log(
        `[Sync] Clinics sync completed. ` +
        `Created: ${result.created}, Updated: ${result.updated}, Deactivated: ${result.deactivated}.`
      );
    } catch (error) {
      this.logger.error('[Sync] Failed to complete the clinics synchronization process.', error.stack);
      // Trong môi trường production, bạn có thể gửi thông báo lỗi đến một kênh giám sát (ví dụ: Sentry, Slack)
    }
  }

  /**
   * Điều phối quá trình đồng bộ hóa danh sách bác sĩ.
   */
  async syncDoctors(): Promise<void> {
    this.logger.log('[Sync] Starting doctors synchronization...');
    try {
      // 1. Gọi API client để lấy dữ liệu thô
      const hospitalDoctors = await this.hospitalClient.fetchDoctors(); 
      
      // 2. Ủy thác việc xử lý cho service nghiệp vụ
      const result = await this.doctorsService.upsertDoctors(hospitalDoctors);

      this.logger.log(
        `[Sync] Doctors sync completed. ` +
        `Created: ${result.created}, Updated: ${result.updated}, Deactivated: ${result.deactivated}.`
      );
    } catch (error) {
      this.logger.error('[Sync] Failed to complete the doctors synchronization process.', error.stack);
    }
  }
}