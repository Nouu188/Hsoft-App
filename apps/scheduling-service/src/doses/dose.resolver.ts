import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { Dose } from './entities/dose.entity';
import { DosesService } from './doses.service';
import { Logger, UseGuards } from '@nestjs/common';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { SYNC_EXCHANGE } from '@app/common/rabbitmq/rabbitmq.module';

@Resolver(() => Dose)
export class DosesResolver {
  private readonly logger = new Logger(DosesResolver.name);

  constructor(
    private readonly dosesService: DosesService,
    private readonly amqpConnection: AmqpConnection, 
  ) {}

  @Query(() => [Dose], { name: 'dosesByIds' })
  async findDosesByIds(
    @Args('dose_ids', { type: () => [ID!]! }) dose_ids: string[],
  ): Promise<Dose[]> {
    return this.dosesService.findByIds(dose_ids);
  }

  @Query(() => [Dose], { name: 'dosesByDateRange' })
  @UseGuards(JwtAuthGuard) 
  getDosesByDateRange(
    @CurrentUser() user: User, 
    @Args('startDate', { type: () => String }) startDateString: string,
    @Args('endDate', { type: () => String }) endDateString: string,
  ) {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    return this.dosesService.findDosesByDateRange(user.id, startDate, endDate);
  }

    @Mutation(() => Boolean, { 
        name: 'syncDosesFromHospital', 
        description: 'Đồng bộ y lệnh từ bệnh viện cho một bệnh nhân'
    })
    async syncDosesFromHospital(
        @Args('ngay', { description: "Ngày bệnh nhân đi khám" }) ngay?: string,
        @Args('mabn', { nullable: true }) mabn?: string,
        @Args('sodienthoai', { nullable: true }) sodienthoai?: string,
        @Args('socmnd', { nullable: true }) socmnd?: string,
        @Args('user_id', { nullable: true }) user_id?: string,
    ): Promise<boolean> {
        if (!mabn && !sodienthoai && !socmnd && !user_id) {
            throw new Error('Either "mabn" or "sodienthoai" or "socmnd" or "user_id" must be provided.');
        }

        const payload = { user_id, mabn, sodienthoai, socmnd, ngay };

        this.amqpConnection.publish(
            SYNC_EXCHANGE,
            'sync.request',
            payload,
        );

        this.logger.log('Sync request has been successfully published to the queue.');
        return true;
    }
}