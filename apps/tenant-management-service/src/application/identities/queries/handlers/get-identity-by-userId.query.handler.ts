import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Identity } from "apps/tenant-management-service/src/domain/identities/entities";
import { Inject, Logger } from "@nestjs/common";
import { IIdentityRepository } from "apps/tenant-management-service/src/domain/identities/interfaces";
import { GetIdentityByUserIdQuery } from "../impl";

@QueryHandler(GetIdentityByUserIdQuery)
export class GetIdentityByUserIdQueryHandler implements IQueryHandler<GetIdentityByUserIdQuery, Identity | null> {
  private readonly logger = new Logger(GetIdentityByUserIdQueryHandler.name);

  constructor(
    @Inject(IIdentityRepository) private readonly identityRepo: IIdentityRepository,
  ) {}

  async execute(query: GetIdentityByUserIdQuery): Promise<Identity | null> {
    const { userId } = query;
    this.logger.debug(`Fetching identity for userId=${userId}`);

    try {
      const identity = await this.identityRepo.findByUserId(userId);

      if (!identity) {
        this.logger.warn(`Identity not found for userId=${userId}`);
        return null;
      }

      this.logger.debug(`Found identity id=${identity.id} for userId=${userId}`);
      return identity;
    } catch (error) {
      this.logger.error(
        `Failed to fetch identity for userId=${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
