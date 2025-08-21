import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppointmentsModule } from './appointments/appointments.module';
import { Appointment } from './appointments/entities/appointment.entity';
import { Clinic } from './clinics/entities/clinic.entity';
import { ClinicsModule } from './clinics/clinics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/appointment-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/appointment-service/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      playground: true, 
    }),
    TypeOrmModule.forRootAsync({
      name: 'appointmentConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('APPOINTMENT_DB_HOST'),
        port: +(configService.get<number>('APPOINTMENT_DB_PORT') as number),
        username: configService.get<string>('APPOINTMENT_DB_USER'),
        password: configService.get<string>('APPOINTMENT_DB_PASS'),
        database: configService.get<string>('APPOINTMENT_DB_NAME'),
        entities: [ Appointment, Clinic ], 
        synchronize: true,
      }),
    }), 
    AppointmentsModule,
    ClinicsModule
  ],
  providers: [
    
  ],
})
export class AppointmentServiceModule {}
