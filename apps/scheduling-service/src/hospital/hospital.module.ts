import { Module } from '@nestjs/common';
import { HospitalResolver } from './hospital.resolver';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        AppRabbitMQModule
    ],
    providers: [HospitalResolver],
})
export class HospitalModule {}