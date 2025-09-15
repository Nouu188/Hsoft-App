import { CurrentUser, JwtAuthGuard, Role, Roles, RolesGuard } from '@app/auth';
import { UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompleteEmailRegistrationCommand, ConfirmNewPasswordCommand, CreateServiceClientCommand, InitiateEmailRegistrationCommand, LoginByEmailCommand, LoginByGoogleCommand, LoginByPhoneNumberCommand, RequestPasswordResetCommand, VerifyPasswordResetCommand } from 'apps/account-service/src/application/commands';
import { CreateServiceClientInput } from 'apps/account-service/src/domain/auth/dtos';
import { ServiceClient } from 'apps/account-service/src/domain/auth/entities/service-client.entity';
import { GoogleAuthGuard } from 'apps/account-service/src/presentation/graphql/guards/google-auth.guard';
import { GoogleLoginInput } from './dtos/login/google-login.input';
import { RequestOtpResponse } from './dtos/otp/request-otp-response.dto';
import { ConfirmPasswordResetInput, RequestPasswordResetInput, VerifyPasswordResetInput } from './dtos/password-reset/password-reset.input';
import { RequestPasswordResetResponse, VerifyPasswordResetResponse } from './dtos/password-reset/password-reset.response';
import { LoginInputByEmail, LoginInputByPhoneNumber, LoginResponse } from './dtos/login';
import { RegisterByEmailInput, VerifyEmailInput } from './dtos/registration';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly commandBus: CommandBus) { }

  @Query(() => String)
  healthCheck(): string {
    return 'OK';
  }

  @Mutation(() => LoginResponse)
  async loginByPhoneNumber(@Args('loginInput') loginInput: LoginInputByPhoneNumber): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginByPhoneNumberCommand(loginInput));
  }

  @Mutation(() => LoginResponse)
  async loginByEmail(@Args('loginInput') loginInput: LoginInputByEmail): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginByEmailCommand(loginInput));
  }

  @UseGuards(GoogleAuthGuard)
  @Mutation(() => LoginResponse)
  async loginWithGoogle(@CurrentUser() user: GoogleLoginInput): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginByGoogleCommand(user));
  }

  // --- PASSWORD RESET MUTATIONS ---
  @Mutation(() => RequestPasswordResetResponse)
  async requestPasswordReset(@Args('input') input: RequestPasswordResetInput): Promise<RequestPasswordResetResponse> {
    await this.commandBus.execute(new RequestPasswordResetCommand(input));

    return { success: true, message: 'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.' };
  }

  @Mutation(() => VerifyPasswordResetResponse)
  async verifyPasswordReset(@Args('input') input: VerifyPasswordResetInput): Promise<VerifyPasswordResetResponse> {
    return this.commandBus.execute(new VerifyPasswordResetCommand(input));
  }

  @Mutation(() => LoginResponse)
  async confirmNewPassword(@Args('input') input: ConfirmPasswordResetInput): Promise<LoginResponse> {
    return this.commandBus.execute(new ConfirmNewPasswordCommand(input));
  }

  // --- EMAIL REGISTRATION MUTATIONS ---
  @Mutation(() => RequestOtpResponse)
  async initiateEmailRegistration(@Args('input') input: RegisterByEmailInput): Promise<RequestOtpResponse> {
    await this.commandBus.execute(new InitiateEmailRegistrationCommand(input));
    return { success: true, message: 'OTP đã được gửi thành công.' };
  }

  @Mutation(() => LoginResponse)
  async completeEmailRegistration(@Args('input') input: VerifyEmailInput): Promise<LoginResponse> {
    return this.commandBus.execute(new CompleteEmailRegistrationCommand(input));
  }

  // --- M2M AUTH MUTATIONS ---
  @Mutation(() => ServiceClient, { name: 'admin_createServiceClient' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createServiceClient(
    @Args('input') input: CreateServiceClientInput,
  ): Promise<Partial<ServiceClient>> {
    return this.commandBus.execute(new CreateServiceClientCommand(input));
  }
}