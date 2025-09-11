import { Inject, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from 'apps/account-service/src/infrastructure/common/services/token.service';
import { LoginResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login.response';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../../../../domain/users/interfaces/user.repository.interface';
import { LoginByPhoneNumberCommand } from '../../impl/login/login-by-phone.command';
import { HospitalRegisterationCommand } from '../../impl/registeration/hospital-registeration.command';

@CommandHandler(LoginByPhoneNumberCommand)
export class LoginByPhoneNumberHandler implements ICommandHandler<LoginByPhoneNumberCommand, LoginResponse> {
  private readonly logger = new Logger(LoginByPhoneNumberHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly commandBus: CommandBus,
  ) { }

  async execute(command: LoginByPhoneNumberCommand): Promise<LoginResponse> {
    const { phoneNumber, password } = command.loginInput;

    this.logger.debug(`Attempting login with phone number: ${phoneNumber}`);

    try {
      const existingUser = await this.userRepository.findByPhoneNumber(phoneNumber);

      if (existingUser) {
        if (!existingUser.password) {
          this.logger.warn(`Login failed: password not set for phone number ${phoneNumber}`);
          throw new UnauthorizedException('Password not set.');
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (isMatch) {
          const tokenPair = await this.tokenService.generateTokenPair(existingUser);
          this.logger.log(`Login successful for userId: ${existingUser.id}`);
          return { user: existingUser, ...tokenPair };
        }

        this.logger.warn(`Login failed: invalid password for phone number ${phoneNumber}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`No existing user found for phone number ${phoneNumber}, proceeding with hospital registration.`);
      return this.commandBus.execute(new HospitalRegisterationCommand(command.loginInput));
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      this.logger.error(`Unexpected error during login with phone number ${phoneNumber}`, error.stack);
      throw new InternalServerErrorException('Unable to process login at the moment');
    }
  }
}
