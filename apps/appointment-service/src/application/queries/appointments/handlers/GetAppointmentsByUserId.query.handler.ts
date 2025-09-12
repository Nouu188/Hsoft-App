import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { Appointment, IAppointmentRepository } from 'apps/appointment-service/src/domain';
import { GetAppointmentsByUserIdQuery } from '../GetAppointmentsByUserId.query';
import { AppointmentTransactionService } from 'apps/appointment-service/src/infrastructure/common';

@QueryHandler(GetAppointmentsByUserIdQuery)
export class GetAppointmentsByUserIdHandler implements IQueryHandler<GetAppointmentsByUserIdQuery, Appointment[]> {
  private readonly logger = new Logger(GetAppointmentsByUserIdHandler.name);

  constructor(
    @Inject(IAppointmentRepository) private readonly appointmentRepo: IAppointmentRepository,
    private readonly transactionService: AppointmentTransactionService
  ) {}

  async execute(query: GetAppointmentsByUserIdQuery): Promise<Appointment[]> {
    try {
      return await this.transactionService.execute(async (manager) => {
        const appointments = await this.appointmentRepo.findByUserId(query.userId, manager);
        return appointments;
      });
    } catch (error) {
      this.logger.error(`Failed to get appointments for userId=${query.userId}`, error.stack);
      throw new InternalServerErrorException('Unable to fetch appointments'); 
    }
  }
}
