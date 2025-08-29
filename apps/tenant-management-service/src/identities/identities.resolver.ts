import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';
import { M2MJwtGuard } from '@app/auth';
import { IdentitiesService } from './services/identities.service';
import { Identity } from './entities/identity.entity';

@Resolver(() => Identity)
@UseGuards(M2MJwtGuard) 
export class IdentitiesResolver {
  private readonly logger = new Logger(IdentitiesResolver.name);

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

  @Query(() => Identity, { name: 'fetchIdentityFromHospital', nullable: true })
  async fetchIdentityFromHospital(
    @Args('phoneNumber', { type: () => String }) phoneNumber: string,
    @Args('externalHospitalCode', { type: () => String }) externalHospitalCode: string,
  ): Promise<Identity | null> {
    this.logger.debug(
      `[Resolver] Fetch identity from hospital externalCode=${externalHospitalCode}, phone=${phoneNumber}`,
    );

    try {
      return await this.identitiesService.fetchIdentityFromHospital(
        phoneNumber,
        externalHospitalCode,
      );
    } catch (error) {
      this.logger.error(
        `[Resolver] Lỗi khi fetch identity từ hospital externalCode=${externalHospitalCode}, phone=${phoneNumber}`,
        error.stack || error,
      );
      throw error;
    }
  }
}