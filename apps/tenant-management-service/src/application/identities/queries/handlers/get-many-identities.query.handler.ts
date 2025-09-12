import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetManyIdentitiesQuery } from "../impl";
import { Inject, Logger } from "@nestjs/common";
import { Identity, IIdentityRepository } from "apps/tenant-management-service/src/domain";

@CommandHandler(GetManyIdentitiesQuery)
export class GetManyIdentitiesQueryHandler implements ICommandHandler<GetManyIdentitiesQuery, readonly Identity[]> {
  private readonly logger = new Logger(GetManyIdentitiesQueryHandler.name);

  constructor(
    @Inject(IIdentityRepository) 
    private readonly identityRepo: IIdentityRepository,
  ) {}

  async execute(query: GetManyIdentitiesQuery): Promise<readonly Identity[]> {
    const { ids } = query;

    if (!ids || ids.length === 0) {
      this.logger.warn(`[GetManyIdentitiesQueryHandler] Received empty ids array`);
      return [];
    }

    this.logger.debug(`[GetManyIdentitiesQueryHandler] Fetching identities`, { ids });

    try {
      const identities = await this.identityRepo.findMany(ids);

      if (!identities.length) {
        this.logger.warn(`[GetManyIdentitiesQueryHandler] No identities found`, { ids });
        return [];
      }

      this.logger.debug(
        `[GetManyIdentitiesQueryHandler] Found ${identities.length} identities`,
        { requestedIds: ids, foundIds: identities.map(i => i.id) },
      );

      return identities;
    } catch (error) {
      this.logger.error(
        `[GetManyIdentitiesQueryHandler] Failed to fetch identities`,
        { ids, error: error.message, stack: error.stack },
      );
      throw error;
    }
  }
}
