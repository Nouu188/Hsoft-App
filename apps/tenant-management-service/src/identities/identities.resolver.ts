import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { M2MJwtGuard } from '@app/auth';
import { IdentitiesService } from './services/identities.service';
import { Identity } from './entities/identity.entity';

@Resolver(() => Identity)
@UseGuards(M2MJwtGuard) 
export class IdentitiesResolver {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Query(() => Identity, { name: 'identity', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.identitiesService.findOne(id);
  }

  @Query(() => [Identity], { name: 'identitiesByIds' })
  findMany(@Args('ids', { type: () => [ID] }) ids: string[]) {
    return this.identitiesService.findMany(ids);
  }

  @Query(() => Identity, { name: 'identityByUserId' })
  async getIdentityByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<Identity> {
    return this.identitiesService.findByUserId(userId);
  }
}