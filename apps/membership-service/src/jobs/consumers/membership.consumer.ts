import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { QueueName } from '@app/common/rabbitmq/queues';

@Injectable()
export class MembershipConsumer {
  private readonly logger = new Logger(MembershipConsumer.name);

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.USER_PROFILE_UPDATED,
    queue: QueueName.IDENTITY_USER_FIRST_LOGIN,
  })
  async handleUserProfileUpdated(msg: any) {
    this.logger.log(`Received User Profile Updated Event: ${JSON.stringify(msg)}`);
    // TODO: xử lý logic cập nhật membership tại đây
  }
}
