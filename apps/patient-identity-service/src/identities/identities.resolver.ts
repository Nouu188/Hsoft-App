import { CurrentUser, JwtAuthGuard, Role, Roles, RolesGuard } from '@app/auth';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserResponseDto } from 'apps/account-service/src/auth/dto/login.response';
import { CreateOrUpdateIdentityInput } from './dto/create-or-update-identity.input';
import { PatientIdentityObjectType } from './dto/patient-identity.object-type';
import { IdentitiesService } from './identities.service';

@Resolver(() => PatientIdentityObjectType)
@UseGuards(JwtAuthGuard) 
export class IdentitiesResolver {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Query(() => PatientIdentityObjectType, { name: 'myIdentity', nullable: true })
  async getMyIdentity(@CurrentUser() user: UserResponseDto): Promise<PatientIdentityObjectType | null> {
    const identity = await this.identitiesService.findByUserId(user.id);
    if (!identity) {
      return null;
    }
    return identity;
  }

  @Query(() => PatientIdentityObjectType, { name: 'identityByUserId', nullable: true })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) 
  async getIdentityByUserId(@Args('userId') userId: string): Promise<PatientIdentityObjectType | null> {
    return this.identitiesService.findByUserId(userId);
  }

  @Mutation(() => PatientIdentityObjectType)
  async createOrUpdateIdentity(
    @CurrentUser() user: UserResponseDto,
    @Args('input') input: CreateOrUpdateIdentityInput,
  ): Promise<PatientIdentityObjectType> {
    return this.identitiesService.createOrUpdate(user.id, input);
  }
}