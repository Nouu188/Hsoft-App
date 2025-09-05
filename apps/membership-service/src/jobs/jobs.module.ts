import { Module } from '@nestjs/common';
import { MembershipProducer } from './producers/membership.producer';
import { MembershipConsumer } from './consumers/membership.consumer';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        AppRabbitMQModule,
    ],
    providers: [MembershipProducer, MembershipConsumer],
    exports: [MembershipProducer],
})
export class JobsModule { }
