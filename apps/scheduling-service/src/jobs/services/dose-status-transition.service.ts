import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import * as moment from 'moment-timezone';
import { Counter } from 'prom-client';
import { Repository } from 'typeorm';
import { Dose, DoseStatus } from '../../doses/entities/dose.entity';
import { MetricName } from '@app/common/metrics/contracts/metrics.contracts';

@Injectable()
export class DoseStatusTransitionService {
  private readonly logger = new Logger(DoseStatusTransitionService.name);
  private readonly tz = 'Asia/Ho_Chi_Minh';

  constructor(
    @InjectRepository(Dose)
    private readonly doseRepository: Repository<Dose>,
    private readonly configService: ConfigService,

    @InjectMetric(MetricName.DOSES_STATUS_TRANSITIONS_TOTAL)
    private readonly doseStatusTransitions: Counter<string>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Dose Status Transition Job started');

    const transitionedUpcoming = await this.transitionUpcomingToPending();
    const transitionedMissed = await this.transitionPendingToMissed();

    this.logger.debug('Dose Status Transition Job finished', {
      transitionedUpcoming,
      transitionedMissed,
    });
  }

  /**
   * UPCOMING -> PENDING
   */
  async transitionUpcomingToPending(): Promise<number> {
    const now = moment().tz(this.tz).toDate();

    const result = await this.doseRepository
      .createQueryBuilder()
      .update(Dose)
      .set({ status: DoseStatus.PENDING })
      .where('status = :status', { status: DoseStatus.UPCOMING })
      .andWhere('due_at < :now', { now })
      .returning('id')
      .execute();

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(`Transitioned ${affected} doses from UPCOMING to PENDING`);
      this.doseStatusTransitions.inc({ from: DoseStatus.UPCOMING, to: DoseStatus.PENDING }, affected);
    }
    return affected;
  }

  /**
   * PENDING -> MISSED
   */
  async transitionPendingToMissed(): Promise<number> {
    const hours = this.configService.get<number>('DOSE_PENDING_GRACE_HOURS', 4);
    const threshold = moment().tz(this.tz).subtract(hours, 'hours').toDate();

    const result = await this.doseRepository
      .createQueryBuilder()
      .update(Dose)
      .set({ status: DoseStatus.MISSED })
      .where('status = :status', { status: DoseStatus.PENDING })
      .andWhere('due_at < :threshold', { threshold })
      .returning('id')
      .execute();

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.warn(`Transitioned ${affected} doses from PENDING to MISSED`);
      this.doseStatusTransitions.inc({ from: DoseStatus.PENDING, to: DoseStatus.MISSED }, affected);
    }
    return affected;
  }
}
