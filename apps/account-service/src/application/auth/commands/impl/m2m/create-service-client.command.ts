import { ICommand } from '@nestjs/cqrs';
import { CreateServiceClientInput } from 'apps/account-service/src/domain/auth/dtos';

export class CreateServiceClientCommand implements ICommand {
  constructor(public readonly input: CreateServiceClientInput) {}
}
