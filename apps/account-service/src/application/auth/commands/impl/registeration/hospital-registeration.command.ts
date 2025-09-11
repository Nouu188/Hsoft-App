import { ICommand } from '@nestjs/cqrs';
import { LoginInputByPhoneNumber } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login';

export class HospitalRegisterationCommand  implements ICommand {
  constructor(public readonly input: LoginInputByPhoneNumber) {}
}

