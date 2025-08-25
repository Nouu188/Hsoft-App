import { forwardRef, Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { UsersService } from './users.service';
import { AuthLibModule } from '@app/auth';
import { ConfigModule } from '@nestjs/config';
import { HospitalConnection } from './entities/hospital-connection.entity';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([ User, HospitalConnection ], 'accountConnection'),
    HospitalApiClientModule,
    AuthLibModule,
    TenantApiClientModule
  ],
  exports: [
    UsersService,
  ]
})
export class UsersModule {}
