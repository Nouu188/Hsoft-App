import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ServiceClient } from '../../../domain/auth/entities/service-client.entity';
import { CreateServiceClientInput } from 'apps/account-service/src/domain/auth/dtos';
import { IServiceClientRepository } from 'apps/account-service/src/domain/auth/interfaces/service-client.repository.interface';

@Injectable()
export class ServiceClientRepository implements IServiceClientRepository {
    constructor(
        @InjectRepository(ServiceClient, 'authConnection')
        private readonly ormRepository: Repository<ServiceClient>,
    ) { }

    async findByClientId(clientId: string): Promise<ServiceClient | null> {
        return this.ormRepository.findOneBy({ clientId });
    }
    
    create(input: CreateServiceClientInput, manager?: EntityManager): ServiceClient {
        const repository = manager ? manager.getRepository(ServiceClient) : this.ormRepository;
        return repository.create(input);
    }

    async save(client: ServiceClient, manager?: EntityManager): Promise<ServiceClient> {
        const repository = manager ? manager.getRepository(ServiceClient) : this.ormRepository;
        return repository.save(client);
    }
}