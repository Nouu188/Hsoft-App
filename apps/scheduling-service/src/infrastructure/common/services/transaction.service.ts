import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class DoseTransactionService {
  constructor(
    @InjectDataSource('schedulingConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

@Injectable()
export class OutboxTransactionService {
  constructor(
    @InjectDataSource('schedulingConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}