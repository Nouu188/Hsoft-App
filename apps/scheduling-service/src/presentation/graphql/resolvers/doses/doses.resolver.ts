import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GetDoseByIdQuery,
  GetDosesByDateRangeQuery,
  GetDosesBySelectedDateQuery,
  UpdateDosesCommand,
} from 'apps/scheduling-service/src/application';
import {
  Dose,
  UpdateDoseInput,
} from 'apps/scheduling-service/src/domain';
import { User } from 'apps/account-service/src/domain/users/entities';

@Resolver(() => Dose)
export class DosesResolver {
  private readonly logger = new Logger(DosesResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => Dose, { name: 'doseById', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getDoseById(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Dose | null> {
    if (!id) {
      throw new BadRequestException('Dose ID is required');
    }

    try {
      return await this.queryBus.execute(new GetDoseByIdQuery(id, user.id));
    } catch (error) {
      this.logger.error(
        `Failed to fetch dose ${id} for user ${user.id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not fetch dose');
    }
  }

  @Query(() => [Dose], { name: 'dosesByDateRange' })
  @UseGuards(JwtAuthGuard)
  async getDosesByDateRange(
    @CurrentUser() user: User,
    @Args('startDate', { type: () => String }) startDateString: string,
    @Args('endDate', { type: () => String }) endDateString: string,
  ): Promise<Dose[]> {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }
    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    try {
      return await this.queryBus.execute(
        new GetDosesByDateRangeQuery(startDate, endDate, user.id),
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch doses for user ${user.id} in range ${startDateString} - ${endDateString}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not fetch doses by date range');
    }
  }

  @Query(() => [Dose], { name: 'dosesBySelectedDate' })
  @UseGuards(JwtAuthGuard)
  async getDosesBySelectedDate(
    @CurrentUser() user: User,
    @Args('selectedDate', { type: () => String }) selectedDateString: string,
  ): Promise<Dose[]> {
    const date = new Date(selectedDateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid selectedDate');
    }

    try {
      return await this.queryBus.execute(
        new GetDosesBySelectedDateQuery(date, user.id),
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch doses for user ${user.id} on ${selectedDateString}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not fetch doses by selected date');
    }
  }

  @Mutation(() => [Dose], { name: 'updateDoses' })
  @UseGuards(JwtAuthGuard)
  async updateDoses(
    @CurrentUser() user: User,
    @Args('updates', { type: () => [UpdateDoseInput] }) updates: UpdateDoseInput[],
  ): Promise<Dose[]> {
    if (!updates || updates.length === 0) {
      throw new BadRequestException('At least one update is required');
    }

    try {
      return await this.commandBus.execute(
        new UpdateDosesCommand(user.id, updates),
      );
    } catch (error) {
      this.logger.error(
        `Failed to update doses for user ${user.id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update doses');
    }
  }
}
