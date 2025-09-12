import { CurrentUser, JwtAuthGuard, M2MJwtGuard } from '@app/auth';
import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { User } from 'apps/account-service/src/domain/users/entities';
import { GetIdentityByIdQuery, GetIdentityByUserIdQuery, GetIdentityFromHospitalQuery, GetManyIdentitiesQuery } from 'apps/tenant-management-service/src/application';
import { Identity } from 'apps/tenant-management-service/src/domain';

@Resolver(() => Identity)
@UseGuards(M2MJwtGuard)
export class IdentitiesResolver {
  private readonly logger = new Logger(IdentitiesResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Query(() => Identity, { name: 'identity', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.queryBus.execute(new GetIdentityByIdQuery(id));
  }

  @Query(() => [Identity], { name: 'identitiesByIds' })
  findMany(@Args('ids', { type: () => [ID] }) ids: string[]) {
    return this.queryBus.execute(new GetManyIdentitiesQuery(ids));
  }

  @Query(() => Identity, { name: 'identityByUserId', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getIdentityByUserId(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
  ): Promise<Identity | null> {
    const targetUserId = userId ?? user.id;
    this.logger.debug(`Fetching identity for userId=${targetUserId}`);

    const identity = await this.queryBus.execute(new GetIdentityByUserIdQuery(targetUserId));
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
      return await this.queryBus.execute(
        new GetIdentityFromHospitalQuery(phoneNumber, externalHospitalCode),
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