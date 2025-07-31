import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { User } from './users/entities/user.entity';
import { ServiceClient } from './auth/entities/service-client.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/account-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/account-service/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      playground: true, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: +(configService.get<number>('POSTGRES_PORT') as number),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [ User, ServiceClient ], 
        synchronize: true,
      }),
    }),    
    UsersModule, 
    AuthModule,
    HospitalApiClientModule,
  ],
})
export class UserServiceModule {}
