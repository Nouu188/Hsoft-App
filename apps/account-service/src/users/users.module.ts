import { forwardRef, Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { UsersService } from './users.service';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [
    TypeOrmModule.forFeature([ User ]),
    forwardRef(() => AuthModule),
    HospitalApiClientModule
  ],
  exports: [
    UsersService,
  ]
})
export class UsersModule {}
