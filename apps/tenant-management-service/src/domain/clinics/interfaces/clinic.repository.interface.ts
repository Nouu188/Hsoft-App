import { IRepository } from "../../common/interfaces";
import { Clinic } from "../entities";

export const IClinicRepository = Symbol('IClinicRepository');
export interface IClinicRepository extends IRepository<Clinic> {
    findAllActive(): Promise<Clinic[]>;
}