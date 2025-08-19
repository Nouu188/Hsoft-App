import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { HistoryService } from './history.service';
import { GetHistoryArgs } from './dto/get-history.args';
import { NotificationHistory } from './entities/notification-history.entity';
import { MarkAsReadInput } from './dto/mark-as-read.input';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';

@Resolver(() => NotificationHistory)
@UseGuards(JwtAuthGuard)
export class HistoryResolver {
  private readonly logger = new Logger(HistoryResolver.name);

  constructor(
    private readonly historyService: HistoryService,

    @InjectMetric(MetricName.GRAPHQL_REQUESTS_DURATION_SECONDS)
    private readonly requestDuration: Histogram<string>,
  ) { }

  @Query(() => [NotificationHistory], { name: 'myNotificationHistory' })
  async getMyHistory(
    @CurrentUser() user: User,
    @Args() args: GetHistoryArgs,
  ): Promise<NotificationHistory[]> {
    this.logger.debug(`[getMyHistory] Received request for user: ${user.id}`);
    this.logger.debug(`[getMyHistory] With args: ${JSON.stringify(args)}`);

    const end = this.requestDuration.startTimer();

    try {
      const result = await this.historyService.getHistoryForUser(user.id, args);

      this.logger.debug(`[getMyHistory] Returning ${result.length} notification(s) for user: ${user.id}`);

      end({
        [MetricLabel.OPERATION_NAME]: 'myNotificationHistory',
        [MetricLabel.OPERATION_TYPE]: 'query',
        [MetricLabel.STATUS]: 'success'
      });

      return result;
    } catch (error) {
      this.logger.error(`[getMyHistory] Failed to get history for user: ${user.id}`, error.stack);

      end({
        [MetricLabel.OPERATION_NAME]: 'myNotificationHistory',
        [MetricLabel.OPERATION_TYPE]: 'query',
        [MetricLabel.STATUS]: 'error'
      });

      throw error;
    }
  }

  @Mutation(() => Boolean)
  async markNotificationsAsRead(
    @CurrentUser() user: User,
    @Args('input') input: MarkAsReadInput,
  ): Promise<boolean> {
    return this.historyService.markAsRead(user.id, input.notificationIds);
  }

  @Mutation(() => Boolean)
  async deleteNotification(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.historyService.deleteNotification(user.id, id);
  }
}