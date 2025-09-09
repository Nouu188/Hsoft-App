import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { OutboxService } from '@app/outbox';
import { UsersService } from '../../../../users/users.service';
import { UserPayload } from '../../../../users/dto/user.payload';
import { LoginInputByPhoneNumber } from '../../../dto/login/login.input';
import { ILoginStrategy } from '../interfaces/authentication.provider';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';

@Injectable()
export class PhoneNumberAuthenticationProvider implements ILoginStrategy<LoginInputByPhoneNumber> {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantApiClient: TenantApiClientService,
    private readonly outboxService: OutboxService,
  ) {}

  async authenticate(input: LoginInputByPhoneNumber): Promise<UserPayload> {
    const { phoneNumber, password, externalHospitalCode } = input;

    const existingUser = await this.usersService.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      if (!existingUser.password) throw new UnauthorizedException('Password not set.');
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (isMatch) return existingUser;
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!externalHospitalCode) throw new UnauthorizedException('Hospital code is required for first-time login.');

    const hospital = await this.tenantApiClient.getHospitalByCode(externalHospitalCode);
    const identity = await this.tenantApiClient.fetchIdentityFromHospital(phoneNumber, externalHospitalCode);
    if (!identity || !identity.birthYear) throw new UnauthorizedException('Patient info not found.');
    if (password !== identity.birthYear.toString()) throw new UnauthorizedException('Invalid credentials.');

    const userPayload = await this.usersService.createUserFromHospital(identity);

    await this.outboxService.createOutboxMessage({
        aggregateType: 'auth',
        aggregateId: userPayload.id,
        eventType: 'UserFirstLoginSagaInitiated',
        payload: { identity, userId: userPayload.id, externalHospitalCode, hospitalUrl: hospital.graphqlEndpoint },
        exchange: ExchangeName.USER_EVENTS,
        routingKey: RoutingKey.USER_FIRST_LOGIN_SAGA_INITIATED,
    });

    return userPayload;
  }
}