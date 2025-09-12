import { EntityManager } from "typeorm";
import { Appointment } from "../../entities";
import { IRepository } from "../../common";

export const IAppointmentRepository = Symbol('IAppointmentRepository');
export interface IAppointmentRepository extends IRepository<Appointment> {
    findByUserId(userId: string, manager?: EntityManager): Promise<Appointment[]>
}