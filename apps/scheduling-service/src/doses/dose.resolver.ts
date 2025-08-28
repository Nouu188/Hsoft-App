import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { Dose } from './entities/dose.entity';
import { DosesService } from './doses.service';
import { BadRequestException, InternalServerErrorException, Logger, UseGuards } from '@nestjs/common';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UpdateDoseInput } from './dto/update-dose.input';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';

@Resolver(() => Dose)
export class DosesResolver {
  private readonly logger = new Logger(DosesResolver.name);

  constructor(
    private readonly dosesService: DosesService,
    private readonly amqpConnection: AmqpConnection,
    private readonly tenantApiClient: TenantApiClientService,
  ) { }

  @Query(() => Dose, { name: 'doseById', nullable: true })
  @UseGuards(JwtAuthGuard) // Đảm bảo chỉ người dùng đã đăng nhập mới có thể gọi
  async getDoseById(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Dose | null> {
    // Gọi service để lấy thông tin, đảm bảo liều thuốc thuộc về người dùng
    return this.dosesService.findById(id, user.id);
  }

  @Query(() => [Dose], { name: 'dosesByDateRange' })
  @UseGuards(JwtAuthGuard)
  getDosesByDateRange(
    @CurrentUser() user: User,
    @Args('startDate', { type: () => String }) startDateString: string,
    @Args('endDate', { type: () => String }) endDateString: string,
  ) {
    const logger = new Logger('DosesResolver');

    logger.log(`Called getDosesByDateRange for user: ${user.id}`);
    logger.log(`Start: ${startDateString} | End: ${endDateString}`);

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    logger.log(`Parsed date range: ${startDate.toISOString()} x ${endDate.toISOString()}`);

    return this.dosesService.findDosesByDateRange(user.id, startDate, endDate);
  }

  @Query(() => [Dose], { name: 'dosesBySelectedDate' })
  @UseGuards(JwtAuthGuard)
  getDosesBySelectedDate(
    @CurrentUser() user: User,
    @Args('selectedDate', { type: () => String }) selectedDateString: string,
  ) {
    const logger = new Logger('DosesResolver');

    logger.log(`Called getDosesBySelectedDate for user: ${user.id}`);
    logger.log(`Input date string: ${selectedDateString}`);

    const date = new Date(selectedDateString);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    logger.log(`Fetching doses from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    return this.dosesService.findDosesByDateRange(user.id, startOfDay, endOfDay);
  }

  @Mutation(() => [Dose], { name: 'updateDoses' })
  @UseGuards(JwtAuthGuard)
  updateDoses(
    @CurrentUser() user: User,
    @Args('updates', { type: () => [UpdateDoseInput] }) updates: UpdateDoseInput[],
  ): Promise<Dose[]> {
    return this.dosesService.updateDoses(user.id, updates);
  }

  @Mutation(() => Boolean, {
    name: 'syncDosesFromHospital',
    description: 'Đồng bộ y lệnh từ bệnh viện cho một bệnh nhân dựa trên số điện thoại',
  })
  async syncDosesFromHospital(
    @Args('phoneNumber', { description: 'Số điện thoại của bệnh nhân' }) phoneNumber: string,
    @Args('externalHospitalCode', { description: 'Mã bệnh viện/GraphQL endpoint' }) externalHospitalCode: string,
  ): Promise<boolean> {
    if (!phoneNumber) {
      this.logger.error(`[DosesSyncResolver] phoneNumber is required`);
      throw new BadRequestException('phoneNumber is required.');
    }

    if (!externalHospitalCode) {
      this.logger.error(`[DosesSyncResolver] externalHospitalCode is required`);
      throw new BadRequestException('externalHospitalCode is required.');
    }

    try {
      const hospitalUrl = await this.tenantApiClient.getHospitalUrlByCode(externalHospitalCode);
      if (!hospitalUrl) {
        this.logger.error(`[DosesSyncResolver] Cannot fetch hospital URL for code: ${externalHospitalCode}`);
        throw new BadRequestException(`Cannot fetch hospital URL for code: ${externalHospitalCode}`);
      }

      const payload = {
        identity: { phoneNumber },
        hospitalUrl,
      };

      this.amqpConnection.publish(
        ExchangeName.SYNC,
        RoutingKey.SYNC_REQUEST,
        payload,
      );

      this.logger.log(`[DosesSyncResolver] Sync request published for phoneNumber: ${phoneNumber}, hospitalCode: ${externalHospitalCode}`);
      return true;
    } catch (error) {
      this.logger.error(`[DosesSyncResolver] Failed to publish sync request for phoneNumber: ${phoneNumber}`, error.stack);
      throw new InternalServerErrorException('Failed to publish sync request.');
    }
  }
}