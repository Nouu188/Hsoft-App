import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Role } from '@app/auth/enums/role.enum';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/auth';
import { M2mService } from './m2m.service';
import { CreateServiceClientInput } from '../auth/dto/create-service-client.input';
import { ServiceClient } from '../auth/entities/service-client.entity';

@Resolver()
export class M2mResolver {
  constructor(private readonly m2mService: M2mService) {}

  @Mutation(() => ServiceClient, { name: 'admin_createServiceClient' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createServiceClient(@Args('input') input: CreateServiceClientInput): Promise<Partial<ServiceClient>> {
    return this.m2mService.createServiceClient(input);
  }
}