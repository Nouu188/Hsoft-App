import { ExchangeName } from "@app/common/rabbitmq/exchanges";
import { RoutingKey } from "@app/common/rabbitmq/routing-keys";
import { OutboxService } from "@app/outbox";
import { BadRequestException, Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AppointmentStatus, IAppointmentRepository } from "apps/appointment-service/src/domain";
import { AppointmentTransactionService } from "apps/appointment-service/src/infrastructure/common";
import { CancelAppointmentCommand } from "../CancelAppointment.command";

@CommandHandler(CancelAppointmentCommand)
export class CancelAppointmentCommandHandler implements ICommandHandler<CancelAppointmentCommand, boolean> {
  private readonly logger = new Logger(CancelAppointmentCommandHandler.name);

  constructor(
    @Inject(IAppointmentRepository) private readonly appointmentRepo: IAppointmentRepository,
    private readonly transactionService: AppointmentTransactionService,
    @Inject('OutboxService_appointmentConnection') private readonly outboxService: OutboxService,
  ) { }

  async execute(command: CancelAppointmentCommand): Promise<boolean> {
    const { userId, appointmentId } = command;
    this.logger.log(`User ${userId} is attempting to cancel appointment ${appointmentId}`);

    try {
      return await this.transactionService.execute(async (manager) => {
        const appointment = await this.appointmentRepo.findById(appointmentId, manager);

        if (!appointment || appointment.userId !== userId) {
          throw new NotFoundException('Lịch hẹn không tồn tại hoặc bạn không có quyền hủy.');
        }

        if (appointment.status === AppointmentStatus.COMPLETED) {
          throw new BadRequestException('Không thể hủy lịch hẹn đã hoàn thành.');
        }

        appointment.status = AppointmentStatus.CANCELLED;
        await this.appointmentRepo.save(appointment, manager);

        await this.outboxService.createOutboxMessage(
          {
            aggregateType: 'Appointment',
            aggregateId: appointmentId,
            eventType: 'AppointmentCancelled',
            payload: { appointmentId, userId },
            exchange: ExchangeName.APPOINTMENT_EVENTS,
            routingKey: RoutingKey.APPOINTMENT_CANCELLED,
          },
          manager,
        );

        this.logger.log(`Outbox message created for cancelled appointment ${appointmentId}`);

        return true;
      });
    } catch (error) {
      this.logger.error(`Failed to cancel appointment ${appointmentId} for user ${userId}`, error.stack);
      throw error;
    }
  }
}
