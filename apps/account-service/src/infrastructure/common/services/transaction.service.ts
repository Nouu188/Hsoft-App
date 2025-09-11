import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class AccountTransactionService {
  constructor(
    @InjectDataSource('accountConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

@Injectable()
export class AuthTransactionService {
  constructor(
    @InjectDataSource('authConnection')
    private readonly dataSource: DataSource,
  ) {}

  async execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}