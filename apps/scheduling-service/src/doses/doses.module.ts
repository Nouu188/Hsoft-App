import { Module } from '@nestjs/common';
import { DosesService } from './doses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dose } from './entities/dose.entity';
import { DosesResolver } from './dose.resolver';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [DosesService, DosesResolver],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ Dose ]),
    AppRabbitMQModule,
  ]
})
export class DosesModule {}
