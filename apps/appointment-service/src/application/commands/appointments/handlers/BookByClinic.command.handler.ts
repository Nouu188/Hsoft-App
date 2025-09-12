import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Appointment, AppointmentType, calculateQueueNumber, createAppointmentEntity, IAppointmentRepository, isIdentityComplete } from 'apps/appointment-service/src/domain';
import { AppointmentTransactionService } from 'apps/appointment-service/src/infrastructure/common';
import dayjs from 'dayjs';
import { BookByClinicCommand } from '../BookByClinic.command';

@CommandHandler(BookByClinicCommand)
export class BookByClinicCommandHandler implements ICommandHandler<BookByClinicCommand, Appointment[]> {
  private readonly logger = new Logger(BookByClinicCommandHandler.name);

  constructor(
    @Inject(IAppointmentRepository) private readonly appointmentRepo: IAppointmentRepository,
    private readonly transactionService: AppointmentTransactionService,
    @Inject('OutboxService_appointmentConnection') private readonly outboxService: OutboxService,
    private readonly tenantApiClient: TenantApiClientService,
  ) {}

  async execute(command: BookByClinicCommand): Promise<Appointment[]> {
    const { userId, inputs } = command;

    if (!inputs || inputs.length === 0) {
      throw new BadRequestException('Không có dữ liệu lịch hẹn để đặt.');
    }

    const results: Appointment[] = [];

    for (const input of inputs) {
      const appointment = await this.bookSingleClinicAppointment(userId, input);
      results.push(appointment);
    }

    return results;
  }

  private async bookSingleClinicAppointment(userId: string, input: any): Promise<Appointment> {
    const identity = await this.tenantApiClient.getIdentityByUserId(userId);
    if (!identity || !isIdentityComplete(identity)) {
      throw new BadRequestException('Vui lòng hoàn tất thông tin danh tính trước khi đặt lịch.');
    }

    return this.transactionService.execute(async (manager) => {
      let queueNumber = 1;
      if (input.clinicId) {
        queueNumber = await calculateQueueNumber(manager, input.clinicId, dayjs(input.appointmentTime));
      }

      const savedAppointment = await createAppointmentEntity(manager, identity, input, AppointmentType.CLINIC, queueNumber);

      await this.outboxService.createOutboxMessage(
        {
          aggregateType: 'Appointment',
          aggregateId: savedAppointment.id,
          eventType: 'AppointmentBooked',
          payload: {
            appointmentId: savedAppointment.id,
            userId: savedAppointment.userId,
            clinicId: savedAppointment.clinicId,
            doctorId: savedAppointment.doctorId,
            appointmentTime: savedAppointment.appointmentTime,
          },
          exchange: ExchangeName.APPOINTMENT_EVENTS,
          routingKey: RoutingKey.APPOINTMENT_BOOKED,
        },
        manager,
      );

      this.logger.log(`Clinic appointment ${savedAppointment.id} booked successfully for user ${userId}`);
      return savedAppointment;
    });
  }
}
