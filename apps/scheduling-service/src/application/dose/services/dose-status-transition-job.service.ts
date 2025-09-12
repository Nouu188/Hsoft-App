import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter } from "prom-client";
import { DoseStatusTransitionService } from "apps/scheduling-service/src/domain/services/dose-status-transition.service";
import { MetricName } from "@app/common/metrics/contracts/metrics.contracts";

@Injectable()
export class DoseStatusTransitionJobService {
  private readonly logger = new Logger(DoseStatusTransitionJobService.name);

  constructor(
    private readonly domainService: DoseStatusTransitionService,
    private readonly configService: ConfigService,
    @InjectMetric(MetricName.DOSES_STATUS_TRANSITIONS_TOTAL)
    private readonly doseStatusTransitions: Counter<string>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug("Dose Status Transition Job started");

    try {
      const transitionedUpcoming = await this.domainService.transitionUpcomingToPending();
      const graceHours = this.configService.get<number>("DOSE_PENDING_GRACE_HOURS", 4);
      const transitionedMissed = await this.domainService.transitionPendingToMissed(graceHours);

      if (transitionedUpcoming > 0) {
        this.doseStatusTransitions.inc(
          { from: "UPCOMING", to: "PENDING" },
          transitionedUpcoming
        );
      }

      if (transitionedMissed > 0) {
        this.doseStatusTransitions.inc({ from: "PENDING", to: "MISSED" }, transitionedMissed);
      }

      this.logger.debug("Dose Status Transition Job finished", {
        transitionedUpcoming,
        transitionedMissed,
      });
    } catch (err) {
      this.logger.error("Dose Status Transition Job failed", err.stack);
    }
  }
}
