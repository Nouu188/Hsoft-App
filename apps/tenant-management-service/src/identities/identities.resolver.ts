import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard, M2MJwtGuard } from '@app/auth';
import { IdentitiesService } from './services/identities.service';
import { Identity } from './entities/identity.entity';
import { User } from 'apps/account-service/src/users/entities/user.entity';

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

  @Query(() => Identity, { name: 'identityByUserId', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getIdentityByUserId(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
  ): Promise<Identity | null> {
    const targetUserId = userId ?? user.id;
    this.logger.debug(`Fetching identity for userId=${targetUserId}`);

    const identity = await this.identitiesService.findByUserId(targetUserId);
    if (!identity) {
      this.logger.warn(`Identity not found for userId=${targetUserId}`);
      throw new NotFoundException(`Identity not found for user ${targetUserId}`);
    }

    return identity;
  }

  @Query(() => Identity, { name: 'fetchIdentityFromHospital', nullable: true })
  async fetchIdentityFromHospital(
    @Args('phoneNumber', { type: () => String }) phoneNumber: string,
    @Args('externalCode', { type: () => String }) externalHospitalCode: string,
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