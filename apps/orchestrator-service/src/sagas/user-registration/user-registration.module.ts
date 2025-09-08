import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRegistrationSaga } from './entities/user-registration-saga.entity';
import { UserRegistrationController } from './user-registration.controller';
import { UserRegistrationService } from './user-registration.service';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { OutboxModule } from '@app/outbox';

@Module({
  imports: [
    TypeOrmModule.forFeature([ UserRegistrationSaga ], 'orchestratorConnection',),
    AppRabbitMQModule,
    OutboxModule.forRoot('orchestratorConnection')
  ],
  controllers: [UserRegistrationController],
  providers: [UserRegistrationService],
})
export class UserRegistrationModule {}