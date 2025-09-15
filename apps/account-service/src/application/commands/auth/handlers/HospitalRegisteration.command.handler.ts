import { TenantApiClientService } from "@app/api-clients/tenant/tenant-api-client.service";
import { ExchangeName } from "@app/common/rabbitmq/exchanges";
import { RoutingKey } from "@app/common/rabbitmq/routing-keys";
import { OutboxService } from "@app/outbox";
import { Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "apps/account-service/src/domain/users/interfaces";
import { AccountTransactionService, TokenService } from "apps/account-service/src/infrastructure/common/services";
import { LoginResponse } from "apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login";
import { HospitalRegisterationCommand } from "../HospitalRegisteration.command";
import { Counter, Histogram } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { MetricLabel, MetricName } from "@app/common/metrics/contracts/metrics.contracts";

@CommandHandler(HospitalRegisterationCommand)
export class HospitalRegisterationHandler implements ICommandHandler<HospitalRegisterationCommand, LoginResponse> {
    private readonly logger = new Logger(HospitalRegisterationHandler.name);

    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        @Inject('OutboxService_authConnection') private readonly outboxService: OutboxService,
        private readonly tenantApiClient: TenantApiClientService,
        private readonly tokenService: TokenService,
        private readonly transactionService: AccountTransactionService,

        @InjectMetric(MetricName.AUTH_REGISTRATIONS_TOTAL)
        private readonly registrationsCounter: Counter<string>,

        @InjectMetric(MetricName.AUTH_LOGIN_ATTEMPTS_TOTAL)
        private readonly loginAttemptsCounter: Counter<string>,

        @InjectMetric(MetricName.SYNC_DURATION_SECONDS)
        private readonly registrationDuration: Histogram<string>,
    ) {}

    async execute(command: HospitalRegisterationCommand): Promise<LoginResponse> {
        const { phoneNumber, password, externalHospitalCode } = command.input;
        const timer = this.registrationDuration.startTimer({
            [MetricLabel.SYNC_TYPE]: "hospital_registeration",
        });

        try {
            this.logger.debug(`Hospital registration attempt for phoneNumber=${phoneNumber}`);

            if (!externalHospitalCode) {
                this.incrementMetrics("hospital", "failure");
                throw new UnauthorizedException("Hospital code is required for hospital registeration.");
            }

            const hospital = await this.tenantApiClient.getHospitalByCode(externalHospitalCode);
            if (!hospital) {
                this.incrementMetrics("hospital", "failure");
                throw new UnauthorizedException("Hospital not found.");
            }

            const identity = await this.tenantApiClient.fetchIdentityFromHospital(phoneNumber, externalHospitalCode);
            if (!identity || !identity.birthYear) {
                this.incrementMetrics("hospital", "failure");
                throw new UnauthorizedException("Patient info not found.");
            }

            if (password !== identity.birthYear.toString()) {
                this.incrementMetrics("hospital", "failure");
                throw new UnauthorizedException("Invalid credentials.");
            }

            const result = await this.transactionService.execute(async (manager) => {
                const userPayload = await this.userRepository.createByHospital({ phoneNumber, password }, manager);

                await this.outboxService.createOutboxMessage({
                    aggregateType: "auth",
                    aggregateId: userPayload.id,
                    eventType: "UserFirstLoginSagaInitiated",
                    payload: { identity, userId: userPayload.id, externalHospitalCode, hospitalUrl: hospital.graphqlEndpoint },
                    exchange: ExchangeName.USER_EVENTS,
                    routingKey: RoutingKey.USER_FIRST_LOGIN_SAGA_INITIATED,
                });

                const tokenPair = await this.tokenService.generateTokenPair(userPayload);

                this.logger.log(`Hospital registration successful for userId=${userPayload.id}`);
                this.incrementMetrics("hospital", "success");
                return { user: userPayload, ...tokenPair };
            });

            return result;
        } catch (error) {
            this.logger.error(`Hospital registration failed: ${error.message}`, error.stack);
            throw error;
        } finally {
            timer({ [MetricLabel.STATUS]: "finished" });
        }
    }

    private incrementMetrics(method: string, status: string) {
        this.registrationsCounter.inc({ [MetricLabel.LOGIN_METHOD]: method, [MetricLabel.STATUS]: status });
        this.loginAttemptsCounter.inc({ [MetricLabel.LOGIN_METHOD]: method, [MetricLabel.STATUS]: status });
    }
}
