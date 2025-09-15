import { VerifyEmailInput } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/registration/verify-email.input';
import { LoginResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login.response';
import { ICommand } from '@nestjs/cqrs';

export class CompleteEmailRegistrationCommand implements ICommand {
  constructor(public readonly input: VerifyEmailInput) {}
}

export type CompleteEmailRegistrationResult = LoginResponse;
