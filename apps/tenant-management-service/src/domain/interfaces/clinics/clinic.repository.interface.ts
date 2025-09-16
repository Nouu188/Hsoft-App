import { IRepository } from "../../common/interfaces";
import { Clinic } from "../../entities/clinics";

export const IClinicRepository = Symbol('IClinicRepository');
export interface IClinicRepository extends IRepository<Clinic> {
    findAllActive(): Promise<Clinic[]>;

    upsert(clinics: Partial<Clinic>[]): Promise<Clinic[]>;
}