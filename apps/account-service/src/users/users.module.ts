import { forwardRef, Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { UsersService } from './users.service';
import { AuthLibModule } from '@app/auth';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([ User ], 'accountConnection'),
    HospitalApiClientModule,
    AuthLibModule
  ],
  exports: [
    UsersService,
  ]
})
export class UsersModule {}
