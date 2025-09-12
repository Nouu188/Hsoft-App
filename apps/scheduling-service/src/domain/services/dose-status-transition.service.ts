import { Inject, Injectable } from "@nestjs/common";
import * as moment from "moment-timezone";
import { DoseStatus } from "../entities";
import { IDoseRepository } from "../interfaces";

@Injectable()
export class DoseStatusTransitionService {
  private readonly tz = "Asia/Ho_Chi_Minh";

  constructor(
    @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository,
  ) {}

  /**
   * Chuyển UPCOMING -> PENDING
   */
  async transitionUpcomingToPending(manager?: any): Promise<number> {
    const now = moment().tz(this.tz).toDate();

    const result = await this.doseRepo
      .updateStatusByCondition(
        { status: DoseStatus.UPCOMING, dueAtBefore: now },
        DoseStatus.PENDING,
        manager
      );

    return result;
  }

  /**
   * Chuyển PENDING -> MISSED
   */
  async transitionPendingToMissed(graceHours: number, manager?: any): Promise<number> {
    const threshold = moment().tz(this.tz).subtract(graceHours, "hours").toDate();

    const result = await this.doseRepo
      .updateStatusByCondition(
        { status: DoseStatus.PENDING, dueAtBefore: threshold },
        DoseStatus.MISSED,
        manager
      );

    return result;
  }
}
