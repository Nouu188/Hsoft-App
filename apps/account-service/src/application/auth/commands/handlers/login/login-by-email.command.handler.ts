import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../../../../domain/users/interfaces/user.repository.interface';
import { LoginByEmailCommand } from '../../impl/login/login-by-email.command';
import { Inject } from '@nestjs/common';
import { LoginResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login.response';
import { TokenService } from 'apps/account-service/src/infrastructure/common/services';

@CommandHandler(LoginByEmailCommand)
export class LoginByEmailHandler implements ICommandHandler<LoginByEmailCommand, LoginResponse> {
  private readonly logger = new Logger(LoginByEmailHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginByEmailCommand): Promise<LoginResponse> {
    const { email, password } = command.loginInput;

    this.logger.debug(`Attempting login for email: ${email}`);

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      this.logger.warn(`Login failed for email: ${email} (user not found or missing password).`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed for email: ${email} (invalid password).`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenPair = await this.tokenService.generateTokenPair(user);

    this.logger.log(`Login successful for userId: ${user.id}`);
    return { user, ...tokenPair };
  }
}
