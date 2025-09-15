import { ICommand } from '@nestjs/cqrs';
import { ServiceClient } from 'apps/account-service/src/domain/auth/entities/service-client.entity';

export class GenerateM2mTokenCommand implements ICommand {
  constructor(public readonly input: ServiceClient) {}
}
