import { ICommand } from "@nestjs/cqrs";
import { LoginInputByEmail } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login-by-email.input";

export class LoginByEmailCommand implements ICommand {
  constructor(public readonly loginInput: LoginInputByEmail) {}
}