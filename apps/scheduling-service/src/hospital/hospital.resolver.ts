import { Mutation, Resolver, Args, Query } from '@nestjs/graphql';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Logger } from '@nestjs/common';
import { SYNC_EXCHANGE } from '@app/common/rabbitmq/rabbitmq.module';

@Resolver()
export class HospitalResolver {
    private readonly logger = new Logger(HospitalResolver.name);

    constructor(
        private readonly amqpConnection: AmqpConnection, 
    ) {}

    @Query(() => String, { name: 'pingSchedulingService' })
    ping(): string {
        return 'Pong from Scheduling Service!';
    }

    @Mutation(() => Boolean, { 
        name: 'triggerReminderForPatient', 
        description: 'Mô phỏng việc bệnh viện gửi yêu cầu đồng bộ y lệnh cho một bệnh nhân.'
    })
    async triggerReminderForPatient(
        @Args('ngay') ngay?: string,
        @Args('mabn', { nullable: true }) mabn?: string,
        @Args('sodienthoai', { nullable: true }) sodienthoai?: string,
        @Args('socmnd', { nullable: true }) socmnd?: string,
    ): Promise<boolean> {
        if (!mabn && !sodienthoai && !socmnd) {
            throw new Error('Either "mabn" or "sodienthoai" or "socmnd" must be provided.');
        }

        const payload = { mabn, sodienthoai, socmnd, ngay };

        this.amqpConnection.publish(
            SYNC_EXCHANGE,
            'sync.request',
            payload,
        );

        this.logger.log('Sync request has been successfully published to the queue.');
        return true;
    }
}