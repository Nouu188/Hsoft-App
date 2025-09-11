import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ServiceClient } from 'apps/account-service/src/domain/auth/entities/service-client.entity';
import { IServiceClientRepository } from 'apps/account-service/src/domain/auth/interfaces';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';

@Injectable()
export class ClientCredentialsStrategy extends PassportStrategy(Strategy, 'client-credentials') {
  private readonly logger = new Logger(ClientCredentialsStrategy.name);

  constructor(
    @Inject(IServiceClientRepository) private readonly serviceClientRepository: IServiceClientRepository,
  ) {
    super({ usernameField: 'clientId', passwordField: 'clientSecret' });
  }

  async validate(clientId: string, clientSecret: string): Promise<ServiceClient> {
    this.logger.debug(`Validating client credentials for clientId: ${clientId}`);

    const client = await this.serviceClientRepository.findByClientId(clientId);

    if (!client) {
      this.logger.warn(`Client with ID ${clientId} not found.`);
      throw new UnauthorizedException('Invalid client credentials.');
    }

    const passwordMatches = await bcrypt.compare(clientSecret, client.clientSecret);

    if (!passwordMatches) {
      this.logger.warn(`Invalid secret for clientId: ${clientId}`);
      throw new UnauthorizedException('Invalid client credentials.');
    }

    this.logger.log(`Client ${clientId} authenticated successfully.`);
    return client;
  }
}