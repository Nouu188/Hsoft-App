import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { OutboxService } from '@app/outbox';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Appointment, AppointmentType, createAppointmentEntity, isIdentityComplete } from 'apps/appointment-service/src/domain';
import { AppointmentTransactionService } from 'apps/appointment-service/src/infrastructure/common';
import { BookByDoctorCommand } from '../BookByDoctor.command';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';

@CommandHandler(BookByDoctorCommand)
export class BookByDoctorCommandHandler implements ICommandHandler<BookByDoctorCommand, Appointment[]> {
    private readonly logger = new Logger(BookByDoctorCommandHandler.name);

    constructor(
        private readonly transactionService: AppointmentTransactionService,
        @Inject('OutboxService_appointmentConnection')  private readonly outboxService: OutboxService,
        private readonly tenantApiClient: TenantApiClientService,
    ) { }

    async execute(command: BookByDoctorCommand): Promise<Appointment[]> {
        const { userId, inputs } = command;

        if (!inputs || inputs.length === 0) {
            throw new BadRequestException('Không có dữ liệu lịch hẹn để đặt.');
        }

        const results: Appointment[] = [];

        for (const input of inputs) {
            const appointment = await this.bookSingleDoctorAppointment(userId, input);
            results.push(appointment);
        }

        return results;
    }

    private async bookSingleDoctorAppointment(userId: string, input: any): Promise<Appointment> {
        const identity = await this.tenantApiClient.getIdentityByUserId(userId);
        if (!identity || !isIdentityComplete(identity)) {
            throw new BadRequestException('Vui lòng hoàn tất thông tin danh tính trước khi đặt lịch.');
        }

        return this.transactionService.execute(async (manager) => {
            const savedAppointment = await createAppointmentEntity(manager, identity, input, AppointmentType.DOCTOR);

            await this.outboxService.createOutboxMessage(
                {
                    aggregateType: 'Appointment',
                    aggregateId: savedAppointment.id,
                    eventType: 'AppointmentBooked',
                    payload: {
                        appointmentId: savedAppointment.id,
                        userId: savedAppointment.userId,
                        doctorId: savedAppointment.doctorId,
                        appointmentTime: savedAppointment.appointmentTime,
                    },
                    exchange: ExchangeName.APPOINTMENT_EVENTS,
                    routingKey: RoutingKey.APPOINTMENT_BOOKED,
                },
                manager,
            );

            this.logger.log(`Doctor appointment ${savedAppointment.id} booked successfully for user ${userId}`);
            return savedAppointment;
        });
    }
}
