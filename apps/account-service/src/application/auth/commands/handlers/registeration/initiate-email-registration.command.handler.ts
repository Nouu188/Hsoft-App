import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { ConflictException, Inject, Logger, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from 'apps/account-service/src/domain/users/interfaces';
import { OtpContext } from 'apps/account-service/src/infrastructure/common/enums/otp-context.enum';
import { AccountTransactionService, OtpService } from 'apps/account-service/src/infrastructure/common/services';
import { InitiateEmailRegistrationCommand } from '../../impl/registeration';

import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { MetricLabel, MetricName } from '@app/common/metrics/contracts/metrics.contracts';

@CommandHandler(InitiateEmailRegistrationCommand)
export class InitiateEmailRegistrationHandler implements ICommandHandler<InitiateEmailRegistrationCommand> {
  private readonly logger = new Logger(InitiateEmailRegistrationHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject('OutboxService_authConnection') private readonly outboxService: OutboxService,
    private readonly otpService: OtpService,
    private readonly transactionService: AccountTransactionService,

    @InjectMetric(MetricName.AUTH_OTP_SENT_TOTAL)
    private readonly authOtpSentCounter: Counter<string>,
    @InjectMetric(MetricName.AUTH_REGISTRATIONS_TOTAL)
    private readonly authRegistrationsCounter: Counter<string>,
  ) {}

  async execute(command: InitiateEmailRegistrationCommand): Promise<void> {
    const { email, password } = command.registerInput;

    this.logger.debug(`Initiating email registration for: ${email}`);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Registration failed: email already exists (${email})`);
      this.authRegistrationsCounter.inc({
        [MetricLabel.LOGIN_METHOD]: 'EMAIL',
        [MetricLabel.STATUS]: 'FAILED',
      });
      throw new ConflictException('Email đã được sử dụng.');
    }

    try {
      const otp = await this.otpService.generateAndStoreOtp(
        OtpContext.EMAIL_VERIFICATION,
        email,
        { email, password }
      );

      const commandPayload = {
        to: email,
        subject: `[MedPlusApp] Mã xác thực của bạn là ${otp}`,
        template: 'verification',
        context: { otp },
        history: {
          type: 'EMAIL_VERIFICATION_OTP',
          title: 'Xác thực email đăng ký',
          body: `Mã OTP của bạn là: ${otp}`,
        },
      };

      await this.transactionService.execute(async (manager) => {
        await this.outboxService.createOutboxMessage(
          {
            aggregateType: 'auth',
            aggregateId: email,
            eventType: 'SEND_TRANSACTIONAL_EMAIL_COMMAND',
            payload: commandPayload,
            exchange: ExchangeName.COMMANDS,
            routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL_COMMAND,
          },
          manager,
        );
      });

      this.logger.log(`OTP sent successfully for email=${email}`);

      this.authOtpSentCounter.inc({
        [MetricLabel.OTP_CHANNEL]: 'EMAIL',
        [MetricLabel.STATUS]: 'SUCCESS',
      });
      this.authRegistrationsCounter.inc({
        [MetricLabel.LOGIN_METHOD]: 'EMAIL',
        [MetricLabel.STATUS]: 'INITIATED',
      });
      
    } catch (error) {
      this.logger.error(`Failed to initiate email registration for ${email}`, error.stack);

      this.authOtpSentCounter.inc({
        [MetricLabel.OTP_CHANNEL]: 'EMAIL',
        [MetricLabel.STATUS]: 'FAILED',
      });
      this.authRegistrationsCounter.inc({
        [MetricLabel.LOGIN_METHOD]: 'EMAIL',
        [MetricLabel.STATUS]: 'FAILED',
      });

      throw new InternalServerErrorException('Unable to initiate registration at the moment');
    }
  }
}
