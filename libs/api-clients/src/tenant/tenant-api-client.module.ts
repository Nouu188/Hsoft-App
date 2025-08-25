import { TenantApiClientService } from './tenant-api-client.service';
import { Module } from '@nestjs/common';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthApiClientModule } from '../auth/auth-api-client.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    AppRabbitMQModule, 
    AuthApiClientModule
  ],
  providers: [TenantApiClientService],
  exports: [TenantApiClientService],
})
export class TenantApiClientModule {}