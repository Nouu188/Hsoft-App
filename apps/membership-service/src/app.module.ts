import { GraphQLJSONObject } from '@app/common/graphql/json.scalar';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as Entities from './membership/entities';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/membership-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/membership-service/schema.gql'),
      sortSchema: true,
      playground: true,
      resolvers: { JSONObject: GraphQLJSONObject },
    }),
    TypeOrmModule.forRootAsync({
      name: 'membershipConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('MEMBERSHIP_DB_HOST'),
        port: +(configService.get<number>('MEMBERSHIP_DB_PORT') as number),
        username: configService.get<string>('MEMBERSHIP_DB_USER'),
        password: configService.get<string>('MEMBERSHIP_DB_PASS'),
        database: configService.get<string>('MEMBERSHIP_DB_NAME'),
        entities: [
          Entities.Membership,
          Entities.MembershipHospital,
          Entities.MembershipClinic,
          Entities.MembershipDoctor,
          Entities.MembershipAppointment,
          Entities.MembershipDose,
          Entities.MembershipNotification,
        ],
        synchronize: true,
      }),
    }),
    AppRabbitMQModule,
  ],
  providers: [],
})
export class MembershipServiceModule { }
