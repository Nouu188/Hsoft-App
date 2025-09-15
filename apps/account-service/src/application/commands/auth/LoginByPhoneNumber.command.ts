import { ICommand } from "@nestjs/cqrs";
import { LoginInputByPhoneNumber } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login-by-phone.input";

export class LoginByPhoneNumberCommand implements ICommand {
  constructor(public readonly loginInput: LoginInputByPhoneNumber) {}
}