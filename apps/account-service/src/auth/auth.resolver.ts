import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LoginResponse } from './dto/login.response';
import { LoginInput } from './dto/login.input';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
import { CreateServiceClientInput } from './dto/create-service-client.input';
import { ServiceClient } from './entities/service-client.entity';
import { Roles } from '../../../../libs/auth/src/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../libs/auth/src/guards/jwt-auth.guard';

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
