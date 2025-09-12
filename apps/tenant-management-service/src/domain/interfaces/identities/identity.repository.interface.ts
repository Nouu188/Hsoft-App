import { IRepository } from "apps/tenant-management-service/src/domain/common/interfaces";
import { DeepPartial } from "typeorm";
import { Identity } from "../../entities/identities";

export const IIdentityRepository = Symbol("IIdentityRepository");
export interface IIdentityRepository extends IRepository<Identity> {
    findByUserId(userId: string): Promise<Identity | null>;

    create(identity: DeepPartial<Identity>): Promise<Identity>;
}