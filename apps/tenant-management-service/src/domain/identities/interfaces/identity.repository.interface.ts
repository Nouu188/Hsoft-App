import { IRepository } from "apps/tenant-management-service/src/domain/common/interfaces";
import { Identity } from "apps/tenant-management-service/src/domain/identities/entities";
import { DeepPartial } from "typeorm";

export const IIdentityRepository = Symbol("IIdentityRepository");
export interface IIdentityRepository extends IRepository<Identity> {
    findByUserId(userId: string): Promise<Identity | null>;

    create(identity: DeepPartial<Identity>): Promise<Identity>;
}