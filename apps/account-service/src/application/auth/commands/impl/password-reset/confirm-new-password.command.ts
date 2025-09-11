import { ICommand } from "@nestjs/cqrs";
import { ConfirmPasswordResetInput } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/password-reset/password-reset.input";

export class ConfirmNewPasswordCommand implements ICommand {
  constructor(public readonly input: ConfirmPasswordResetInput) {}
}