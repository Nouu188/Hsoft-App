import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Dose } from './entities/dose.entity';
import { DosesService } from './doses.service';
import { UseGuards } from '@nestjs/common';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { CurrentUser, JwtAuthGuard } from '@app/auth';

@Resolver(() => Dose)
export class DosesResolver {
  constructor(private readonly dosesService: DosesService) {}

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
}