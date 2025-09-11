import { IRepository } from "../../common/interfaces";
import { Doctor } from "../entities";

export const IDoctorRepository = Symbol('IDoctorRepository');
export interface IDoctorRepository extends IRepository<Doctor> {
    
}