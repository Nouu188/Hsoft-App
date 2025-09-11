import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { GetIdentityByIdQuery } from "../impl";
import { Identity } from "apps/tenant-management-service/src/domain/identities/entities";
import { Inject, Logger } from "@nestjs/common";
import { IIdentityRepository } from "apps/tenant-management-service/src/domain/identities/interfaces";

@QueryHandler(GetIdentityByIdQuery)
export class GetIdentityByIdQueryHandler implements IQueryHandler<GetIdentityByIdQuery, Identity | null> {
  private readonly logger = new Logger(GetIdentityByIdQueryHandler.name);

  constructor(
    @Inject(IIdentityRepository) private readonly identityRepo: IIdentityRepository,
  ) {}

  async execute(query: GetIdentityByIdQuery): Promise<Identity | null> {
    const { id } = query;
    this.logger.debug(`[GetIdentityByIdQueryHandler] Fetching identity id=${id}`);

    try {
      const identity = await this.identityRepo.findById(id);

      if (!identity) {
        this.logger.warn(`[GetIdentityByIdQueryHandler] Identity not found id=${id}`);
        return null;
      }

      this.logger.debug(`[GetIdentityByIdQueryHandler] Found identity id=${id}`);
      return identity;
    } catch (error) {
      this.logger.error(`[GetIdentityByIdQueryHandler] Failed to fetch identity id=${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
