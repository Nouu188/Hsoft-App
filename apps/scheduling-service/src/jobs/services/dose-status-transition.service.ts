// apps/scheduling-service/src/jobs/services/dose-status-transition.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Dose, DoseStatus } from '../../doses/entities/dose.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import * as moment from 'moment-timezone';

@Injectable()
export class DoseStatusTransitionService {
  private readonly logger = new Logger(DoseStatusTransitionService.name);

  constructor(
    @InjectRepository(Dose)
    private readonly doseRepository: Repository<Dose>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES) // Chạy mỗi 5 phút
  async handleCron() {
    this.logger.log('Running Dose Status Transition Job...');
    await this.transitionUpcomingToPending();
    await this.transitionPendingToMissed();
    this.logger.log('Dose Status Transition Job finished.');
  }

  /**
   * Chuyển các liều UPCOMING thành PENDING khi đến giờ uống.
   * Một liều được coi là "đến giờ" khi thời gian hiện tại nằm trong khoảng
   * từ thời gian uống (due_at) đến thời gian uống của liều tiếp theo.
   */
  async transitionUpcomingToPending(): Promise<void> {
    const now = moment().tz('Asia/Ho_Chi_Minh').toDate();

    // Tìm tất cả các liều UPCOMING mà đã đến giờ uống
    const dosesToBecomePending = await this.doseRepository.find({
      where: {
        status: DoseStatus.UPCOMING,
        due_at: LessThan(now),
      },
    });

    if (dosesToBecomePending.length > 0) {
      const ids = dosesToBecomePending.map(d => d.id);
      await this.doseRepository.update(ids, { status: DoseStatus.PENDING });
      this.logger.log(`Transitioned ${ids.length} doses from UPCOMING to PENDING.`);
    }
  }

  /**
   * Chuyển các liều PENDING thành MISSED nếu quá hạn.
   * Một liều được coi là quá hạn nếu đã qua 4 tiếng kể từ giờ uống.
   */
  async transitionPendingToMissed(): Promise<void> {
    const fourHoursAgo = moment().tz('Asia/Ho_Chi_Minh').subtract(4, 'hours').toDate();

    // Tìm tất cả các liều PENDING mà đã quá 4 tiếng
    const dosesToBecomeMissed = await this.doseRepository.find({
      where: {
        status: DoseStatus.PENDING,
        due_at: LessThan(fourHoursAgo),
      },
    });

    if (dosesToBecomeMissed.length > 0) {
      const ids = dosesToBecomeMissed.map(d => d.id);
      await this.doseRepository.update(ids, { status: DoseStatus.MISSED });
      this.logger.log(`Transitioned ${ids.length} doses from PENDING to MISSED.`);
    }
  }
}