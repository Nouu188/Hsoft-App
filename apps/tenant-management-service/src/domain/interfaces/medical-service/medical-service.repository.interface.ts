import { IRepository } from '../../common/interfaces';
import { DeepPartial, EntityManager } from 'typeorm';
import { MedicalService } from '../../entities';

export const IMedicalServiceRepository = Symbol('IMedicalServiceRepository');

export interface IMedicalServiceRepository extends IRepository<MedicalService> {
  findManyByIds(ids: string[]): Promise<MedicalService[]>;  

  upsert(services: Partial<MedicalService>[]): Promise<MedicalService[]>;
}