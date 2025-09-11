import { ICommand } from "@nestjs/cqrs";
import { VerifyPasswordResetInput } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/password-reset/password-reset.input";

export class VerifyPasswordResetCommand implements ICommand {
  constructor(public readonly input: VerifyPasswordResetInput) {}
}