import { IRepository } from "apps/tenant-management-service/src/domain";
import { Dose, DoseStatus } from "../../entities";
import { EntityManager } from "typeorm";

export const IDoseRepository = Symbol('IDoseRepository');
export interface IDoseRepository extends IRepository<Dose> {
    findByIdAndUserId(id: string, userId: string, manager?: EntityManager): Promise<Dose | null>;
    findByDateRangeAndUserId(startDate: Date, endDate: Date, userId: string, manager?: EntityManager): Promise<Dose[]>;
    findByIdsAndUser(ids: string[], userId: string, manager?: EntityManager): Promise<Dose[]>;
    findByUserIdAndStatus(userId: string, status: DoseStatus, manager?: EntityManager): Promise<Dose[]>;

    upsertFromHospital(dose: Dose, manager?: EntityManager): Promise<Dose>;
    updateStatusByCondition(condition: { status: DoseStatus; dueAtBefore: Date }, newStatus: DoseStatus, manager?: EntityManager): Promise<number>;

    deleteByIds(ids: string[], manager?: EntityManager): Promise<void>;
    deleteByUserId(userId: string, manager?: EntityManager): Promise<number>;
}