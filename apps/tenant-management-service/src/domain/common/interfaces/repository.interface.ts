import { DeepPartial, EntityManager } from "typeorm";

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findMany(ids: string[]): Promise<T[]>;
  save(entity: T | DeepPartial<T>, manager?: EntityManager): Promise<T>;
  save(entities: (T | DeepPartial<T>)[], manager?: EntityManager): Promise<T[]>;
}