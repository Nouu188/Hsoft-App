import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LoginResponse } from './dtos/login.response';
import { LoginInput } from './dtos/login.input';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { Role } from './enums/role.enum';
import { CreateServiceClientInput } from './dtos/create-service-client.input';
import { ServiceClient } from './entities/service-client.entity';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Resolver()
export class AuthResolver {
    constructor(
        private authService: AuthService
    ) {}

  @Mutation(() => ServiceClient, { name: 'admin_createServiceClient' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  createServiceClient(@Args('input') input: CreateServiceClientInput) {
    return this.authService.createServiceClient(input);
  }

  @Mutation(() => LoginResponse, { name: "login" })
  async login(@Args('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    return this.authService.login(loginInput);
  }
}
