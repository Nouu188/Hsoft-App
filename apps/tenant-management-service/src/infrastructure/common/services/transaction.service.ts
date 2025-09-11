import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ClinicTransactionService {
  constructor(
    @InjectDataSource('tenantConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

@Injectable()
export class DoctorTransactionService {
  constructor(
    @InjectDataSource('tenantConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

@Injectable()
export class HospitalTransactionService {
  constructor(
    @InjectDataSource('tenantConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

@Injectable()
export class IdentityTransactionService {
  constructor(
    @InjectDataSource('tenantConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

@Injectable()
export class OutboxTransactionService {
  constructor(
    @InjectDataSource('tenantConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}