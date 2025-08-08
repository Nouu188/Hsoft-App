import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq';

@Injectable()
export class JobSchedulerService {
    private readonly logger = new Logger(JobSchedulerService.name);

    constructor(private readonly amqpConnection: AmqpConnection) {}

    @Cron('0 0 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
    triggerFullSync() {
        this.logger.log('CRON JOB: Triggering start of full daily sync...');
        this.amqpConnection.publish(
            ExchangeName.BATCH_SYNC,
            RoutingKey.BATCH_START_FULL_SYNC,
            {}
        );
    }
}