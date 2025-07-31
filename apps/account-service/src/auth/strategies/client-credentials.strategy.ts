import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceClient } from '../entities/service-client.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientCredentialsStrategy extends PassportStrategy(Strategy, 'client-credentials') {
  constructor(
    @InjectRepository(ServiceClient)
    private serviceClientRepository: Repository<ServiceClient>,
  ) {
    super({ usernameField: 'client_id', passwordField: 'client_secret' });
  }

  async validate(client_id: string, client_secret: string): Promise<ServiceClient> {
    const client = await this.serviceClientRepository.findOneBy({ client_id });

    if (!client || !(await bcrypt.compare(client_secret, client.client_secret))) {
      throw new UnauthorizedException('Invalid client credentials.');
    }
    
    return client;
  }
}