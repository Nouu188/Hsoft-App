import { ApiClientsModule } from '@app/api-clients';
import { AuthLibModule } from '@app/auth';
import { DateTimeScalar } from '@app/common/graphql/datetime.scalar';
import { MetricsInterceptor } from '@app/common/metrics/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLJSONObject } from 'graphql-type-json';
import { join } from 'path';
import { Note } from './notes/entities/note.entity';
import { NotesModule } from './notes/note.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/note-service/schema.gql'),
      sortSchema: true,
      playground: true,
      resolvers: { JSONObject: GraphQLJSONObject },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/note-service/.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('NOTES_DB_HOST'),
        port: +(configService.get<number>('NOTES_DB_PORT') as number),
        username: configService.get<string>('NOTES_DB_USER'),
        password: configService.get<string>('NOTES_DB_PASS'),
        database: configService.get<string>('NOTES_DB_NAME'),
        entities: [Note],
        synchronize: true,
      }),
    }),
    NotesModule,
    ApiClientsModule,
    AuthLibModule,
    MetricsModule
  ],
  providers: [
    DateTimeScalar,
    ConfigModule,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    }
  ],
})
export class NoteServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
