import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JobsResolver } from './jobs.resolver';
import { NotificationConsumer } from './consumers/notification.consumer';
import { ApiClientsModule } from '@app/api-clients';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    HttpModule, 
    ApiClientsModule,
    FirebaseModule,
  ],
  providers: [
    NotificationConsumer, 
    JobsResolver, 
  ],
  exports: [NotificationConsumer]
})
export class JobsModule {}