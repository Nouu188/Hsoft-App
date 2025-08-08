import { Mutation, Resolver, Args, ID } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq';

@Resolver()
export class JobsResolver {
    private readonly logger = new Logger(JobsResolver.name);

    constructor(
      private readonly amqpConnection: AmqpConnection,
    ) {}

    @Mutation(() => Boolean, { name: 'test_triggerNotification' })
    async test_triggerNotification(
        @Args('user_id', { type: () => ID }) user_id: string,
        @Args('dose_id', { type: () => ID }) dose_id: string, 
    ): Promise<boolean> {
      this.logger.log(`Manually triggering test notification for user: ${user_id} with dose: ${dose_id}`);
      
      const payload = { user_id, dose_ids: [dose_id] }; 
      
      this.amqpConnection.publish(
          ExchangeName.NOTIFICATION,
          RoutingKey.NOTIFICATION_SCHEDULE,
          payload,
      );
      return true;
    }
}