import { CreateServiceClientInput } from '../dtos';
import { ServiceClient } from '../entities/service-client.entity';

export const IServiceClientRepository = Symbol('IServiceClientRepository');

export interface IServiceClientRepository {
  findByClientId(clientId: string): Promise<ServiceClient | null>;

  create(input: CreateServiceClientInput): ServiceClient;
  save(client: ServiceClient): Promise<ServiceClient>;
}
