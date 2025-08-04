import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ServiceClient } from '../entities/service-client.entity';

@Injectable()
export class ClientCredentialsStrategy extends PassportStrategy(Strategy, 'client-credentials') {
  private readonly logger = new Logger(ClientCredentialsStrategy.name);

  constructor(
    @InjectRepository(ServiceClient, 'authConnection')
    private serviceClientRepository: Repository<ServiceClient>,
  ) {
    super({ usernameField: 'client_id', passwordField: 'client_secret' });
  }

  async validate(client_id: string, client_secret: string): Promise<ServiceClient> {
    this.logger.debug(`Validating client credentials for client_id: ${client_id}`);

    const client = await this.serviceClientRepository.findOneBy({ client_id });

    if (!client) {
      this.logger.warn(`Client with ID ${client_id} not found.`);
      throw new UnauthorizedException('Invalid client credentials.');
    }

    const passwordMatches = await bcrypt.compare(client_secret, client.client_secret);

    if (!passwordMatches) {
      this.logger.warn(`Invalid secret for client_id: ${client_id}`);
      throw new UnauthorizedException('Invalid client credentials.');
    }

    this.logger.log(`Client ${client_id} authenticated successfully.`);
    return client;
  }
}
