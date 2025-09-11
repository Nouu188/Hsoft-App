import { EntityManager } from "typeorm";
import { IRepository } from "../../common/interfaces";
import { CreateHospitalInput, UpdateHospitalInput } from "../dtos";
import { Hospital } from "../entities";

export const IHospitalRepository = Symbol('IHospitalRepository');
export interface IHospitalRepository extends IRepository<Hospital> {
    findByExternalCode(externalCode: string): Promise<Hospital | null>;

    createOne(input: CreateHospitalInput, entity?: EntityManager): Promise<Hospital>;
    updateOne(input: UpdateHospitalInput, entity?: EntityManager): Promise<Hospital>;
    removeOne(id: string, entity?: EntityManager): Promise<Boolean>;
}