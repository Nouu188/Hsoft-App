import { DeepPartial, EntityManager } from "typeorm";

export interface IRepository<T> {
  findById(id: string, manager?: EntityManager): Promise<T | null>;
  findAll(manager?: EntityManager): Promise<T[]>;
  findMany(ids: string[], manager?: EntityManager): Promise<T[]>;
  save(entity: T | DeepPartial<T>, manager?: EntityManager): Promise<T>;
  save(entities: (T | DeepPartial<T>)[], manager?: EntityManager): Promise<T[]>;
}