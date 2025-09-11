import { ICommand } from "@nestjs/cqrs";
import { RequestPasswordResetInput } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/password-reset/password-reset.input";

export class RequestPasswordResetCommand implements ICommand {
  constructor(public readonly input: RequestPasswordResetInput) {}
}