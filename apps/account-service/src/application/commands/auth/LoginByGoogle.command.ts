import { ICommand } from "@nestjs/cqrs";
import { GoogleLoginInput } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/google-login.input";

export class LoginByGoogleCommand implements ICommand {
  constructor(public readonly input: GoogleLoginInput) {}
}
