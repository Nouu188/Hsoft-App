import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GoogleLoginInput } from './dto/login/google-login.input';
import { LoginInputByEmail, LoginInputByPhoneNumber } from './dto/login/login.input';
import { ConfirmPasswordResetInput, RequestPasswordResetInput, VerifyPasswordResetInput } from './dto/password-reset/password-reset.input';
import { RequestPasswordResetResponse, VerifyPasswordResetResponse } from './dto/password-reset/password-reset.response';
import { RegisterByEmailInput } from './dto/registration/register.input';
import { VerifyEmailInput } from './dto/registration/verify-email.input';
import { RequestOtpResponse } from './dto/request-otp-response.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LoginResponse } from './dto/login/login.response';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService
  ) { }

  @Mutation(() => LoginResponse, { name: "loginByPhoneNumber" })
  async loginByPhoneNumber(@Args('loginInput') loginInput: LoginInputByPhoneNumber): Promise<LoginResponse> {
    return this.authService.loginByPhoneNumber(loginInput);
  }

  @Mutation(() => LoginResponse, { name: "loginByEmail" })
  async loginByEmail(@Args('loginInput') loginInput: LoginInputByEmail): Promise<LoginResponse> {
    return this.authService.loginByEmail(loginInput);
  }

  @UseGuards(GoogleAuthGuard)
  @Mutation(() => LoginResponse, { name: 'loginWithGoogle' })
  async loginWithGoogle(
    @Args('googleLoginInput') googleLoginInput: GoogleLoginInput,
  ): Promise<LoginResponse> {
    return this.authService.loginWithGoogle(googleLoginInput);
  }

  // --- PASSWORD RESET MUTATIONS ---
  @Mutation(() => RequestPasswordResetResponse)
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput,
  ): Promise<RequestPasswordResetResponse> {
    return this.authService.requestPasswordReset(input);
  }

  @Mutation(() => VerifyPasswordResetResponse)
  async verifyPasswordReset(
    @Args('input') input: VerifyPasswordResetInput,
  ): Promise<VerifyPasswordResetResponse> {
    return this.authService.verifyPasswordReset(input);
  }

  @Mutation(() => LoginResponse)
  async confirmNewPassword(
    @Args('input') input: ConfirmPasswordResetInput,
  ): Promise<LoginResponse> {
    return this.authService.confirmNewPassword(input);
  }

  @Mutation(() => RequestOtpResponse)
  async initiateEmailRegistration(
    @Args('registerInput') registerInput: RegisterByEmailInput,
  ): Promise<RequestOtpResponse> {
    return this.authService.initiateEmailRegistration(registerInput);
  }

  @Mutation(() => LoginResponse)
  async completeEmailRegistration(
    @Args('verifyInput') verifyInput: VerifyEmailInput,
  ): Promise<LoginResponse> {
    return this.authService.completeEmailRegistration(verifyInput);
  }
}
