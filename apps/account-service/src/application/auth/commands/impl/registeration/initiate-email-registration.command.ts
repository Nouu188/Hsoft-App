import { ICommand } from '@nestjs/cqrs';
import { RegisterByEmailInput } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/registration/register-by-email.input';

export class InitiateEmailRegistrationCommand implements ICommand {
  constructor(
    public readonly registerInput: RegisterByEmailInput,
  ) {}
}
