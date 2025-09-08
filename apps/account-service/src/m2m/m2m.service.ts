import { AuthPayload } from '@app/auth';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceClient } from '../auth/entities/service-client.entity';
import { CreateServiceClientInput } from '../auth/dto/create-service-client.input';

@Injectable()
export class M2mService {
  private readonly logger = new Logger(M2mService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(ServiceClient, 'authConnection')
    private readonly serviceClientRepository: Repository<ServiceClient>,
  ) {}

  async createServiceClient(input: CreateServiceClientInput): Promise<Partial<ServiceClient>> {
    this.logger.log(`Creating new service client: ${input.name}`);
    const newClient = this.serviceClientRepository.create(input);

    await this.serviceClientRepository.save(newClient);
    
    const { client_secret, ...result } = newClient;
    this.logger.log(`Service client ${result.name} created successfully with client_id: ${result.client_id}`);
    
    return result;
  }

  generateM2MToken(client: ServiceClient): { accessToken: string } {
    const payload: AuthPayload = {
      sub: client.client_id,
      scopes: client.scopes,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    this.logger.debug(`Generated M2M token for client_id: ${client.client_id}`);
    return { accessToken };
  }
}