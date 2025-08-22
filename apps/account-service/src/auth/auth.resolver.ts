import { RolesGuard } from '@app/auth';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from '../../../../libs/auth/src/decorators/roles.decorator';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
import { JwtAuthGuard } from '../../../../libs/auth/src/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CreateServiceClientInput } from './dto/create-service-client.input';
import { LoginInputByEmail, LoginInputByIdentifier } from './dto/login.input';
import { LoginResponse } from './dto/login.response';
import { RegisterByEmailInput } from './dto/register.input';
import { VerifyEmailInput } from './dto/verify-email.input';
import { ServiceClient } from './entities/service-client.entity';
import { GoogleLoginInput } from './dto/google-login.input';
import { RequestOtpResponse } from './dto/request-otp-response.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService
  ) { }

  @Mutation(() => ServiceClient, { name: 'admin_createServiceClient' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createServiceClient(@Args('input') input: CreateServiceClientInput) {
    return this.authService.createServiceClient(input);
  }

  @Mutation(() => LoginResponse, { name: "loginByIdentifier" })
  async loginByIdentifer(@Args('loginInput') loginInput: LoginInputByIdentifier): Promise<LoginResponse> {
    return this.authService.loginByIdentifier(loginInput);
  }

  @Mutation(() => LoginResponse, { name: "loginByEmail" })
  async loginByEmail(@Args('loginInput') loginInput: LoginInputByEmail): Promise<LoginResponse> {
    return this.authService.loginByEmail(loginInput);
  }

  @Mutation(() => RequestOtpResponse)
  async requestEmailVerification(
    @Args('registerInput') registerInput: RegisterByEmailInput,
  ): Promise<RequestOtpResponse> {
    return this.authService.requestEmailVerification(registerInput);
  }

  @Mutation(() => LoginResponse)
  async verifyEmailAndRegister(
    @Args('verifyInput') verifyInput: VerifyEmailInput,
  ): Promise<LoginResponse> {
    return this.authService.verifyEmailAndRegister(verifyInput);
  }

  @Mutation(() => LoginResponse, { name: 'loginWithGoogle' })
  async loginWithGoogle(
    @Args('googleLoginInput') googleLoginInput: GoogleLoginInput,
  ): Promise<LoginResponse> {
    return this.authService.loginWithGoogle(googleLoginInput);
  }
}
