import { Module } from '@nestjs/common';
import { DosesService } from './doses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dose } from './entities/dose.entity';
import { DosesResolver } from './dose.resolver';
import { ConfigModule } from '@nestjs/config';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { AuthLibModule } from '@app/auth';

@Module({
  providers: [DosesService, DosesResolver],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ Dose ]),
    AppRabbitMQModule,
    AuthLibModule,
    TenantApiClientModule
  ]
})
export class DosesModule {}
