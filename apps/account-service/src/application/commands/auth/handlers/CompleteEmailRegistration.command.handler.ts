import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from 'apps/account-service/src/domain/users/interfaces/user.repository.interface';
import { OtpContext } from 'apps/account-service/src/infrastructure/common/enums/otp-context.enum';
import { AccountTransactionService } from 'apps/account-service/src/infrastructure/common/services';
import { OtpService } from 'apps/account-service/src/infrastructure/common/services/otp.service';
import { TokenService } from 'apps/account-service/src/infrastructure/common/services/token.service';
import { RegisterByEmailInput } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/registration/register-by-email.input';
import { CompleteEmailRegistrationCommand, CompleteEmailRegistrationResult } from '../CompleteEmailRegistration.command';

import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { MetricLabel, MetricName } from '@app/common/metrics/contracts/metrics.contracts';

@CommandHandler(CompleteEmailRegistrationCommand)
export class CompleteEmailRegistrationHandler implements ICommandHandler<CompleteEmailRegistrationCommand, CompleteEmailRegistrationResult> {
  private readonly logger = new Logger(CompleteEmailRegistrationHandler.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly transactionService: AccountTransactionService,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,

    @InjectMetric(MetricName.AUTH_REGISTRATIONS_TOTAL)
    private readonly authRegistrationsCounter: Counter<string>,

    @InjectMetric(MetricName.USER_REGISTRATIONS_TOTAL)
    private readonly userRegistrationsCounter: Counter<string>,
  ) { }

  async execute(command: CompleteEmailRegistrationCommand): Promise<CompleteEmailRegistrationResult> {
    const { email, otp } = command.input;
    this.logger.log(`Completing email registration for: ${email}`);

    try {
      const registerInput = await this.otpService.verifyOtp<RegisterByEmailInput>(
        OtpContext.EMAIL_VERIFICATION,
        email,
        otp,
      );

      return this.transactionService.execute(async (manager) => {
        const newUser = await this.userRepository.createByEmail(registerInput, manager);

        await this.otpService.invalidateOtp(OtpContext.EMAIL_VERIFICATION, email);

        const tokenPair = await this.tokenService.generateTokenPair(newUser);

        this.logger.log(`Registration successful for userId=${newUser.id}`);

        this.authRegistrationsCounter.inc({
          [MetricLabel.LOGIN_METHOD]: 'EMAIL',
          [MetricLabel.STATUS]: 'SUCCESS',
        });
        this.userRegistrationsCounter.inc({
          [MetricLabel.REGISTRATION_SOURCE]: 'EMAIL',
          [MetricLabel.STATUS]: 'SUCCESS',
        });

        return { user: newUser, ...tokenPair };
      });
    } catch (error) {
      this.logger.error(`Registration failed for email=${email}`, error.stack);

      this.authRegistrationsCounter.inc({
        [MetricLabel.LOGIN_METHOD]: 'EMAIL',
        [MetricLabel.STATUS]: 'FAILED',
      });
      this.userRegistrationsCounter.inc({
        [MetricLabel.REGISTRATION_SOURCE]: 'EMAIL',
        [MetricLabel.STATUS]: 'FAILED',
      });

      throw error;
    }
  }
}
