import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Between, DataSource, EntityManager, Repository } from 'typeorm';
import { BookByClinicInput, BookByDoctorInput } from './dto/book-appointment.input';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly tz = 'Asia/Ho_Chi_Minh';

  constructor(
    @InjectRepository(Appointment, 'appointmentConnection')
    private readonly appointmentRepository: Repository<Appointment>,

    private readonly amqpConnection: AmqpConnection,
    private readonly accountApiClient: AccountApiClientService,
    private readonly tenantApiClient: TenantApiClientService,

    @InjectDataSource('appointmentConnection') 
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

async getMyAppointments(userId: string): Promise<Appointment[]> {
  this.logger.debug(`[getMyAppointments] Fetching all appointments for userId=${userId}`);
  
  try {
    return await this.appointmentRepository.find({
      where: { userId },
      order: { appointmentTime: 'DESC' },
      relations: ['clinic', 'doctor'],
    });
  } catch (error) {
    this.logger.error(`[getMyAppointments] Failed to fetch appointments for userId=${userId}`, error.stack || error);
    throw new InternalServerErrorException('Unable to fetch appointments');
  }
}

  // ============================================================
  // MUTATIONS (WRITE - with transaction if needed)
  // ============================================================

  async bookByClinics(userId: string, inputs: BookByClinicInput[]): Promise<Appointment[]> {
    this.logger.log(`User ${userId} is booking ${inputs.length} appointments by clinics.`);
    return Promise.all(
      inputs.map(input =>
        this.createAppointment(userId, input, AppointmentType.CLINIC),
      ),
    );
  }

  async bookByDoctors(userId: string, inputs: BookByDoctorInput[]): Promise<Appointment[]> {
    this.logger.log(`User ${userId} is booking ${inputs.length} appointments by doctors.`);
    return Promise.all(
      inputs.map(input =>
        this.createAppointment(userId, input, AppointmentType.DOCTOR),
      ),
    );
  }

  async cancelAppointment(userId: string, appointmentId: string): Promise<boolean> {
    this.logger.log(`User ${userId} is attempting to cancel appointment ${appointmentId}`);

    return this.dataSource.transaction(async (manager) => {
      const appointment = await manager.findOne(Appointment, {
        where: { id: appointmentId, userId },
      });

      if (!appointment) {
        throw new NotFoundException('Lịch hẹn không tồn tại hoặc bạn không có quyền hủy.');
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new BadRequestException('Không thể hủy lịch hẹn đã hoàn thành.');
      }

      await manager.update(Appointment, appointmentId, {
        status: AppointmentStatus.CANCELLED,
      });

      // publish event ở ngoài transaction
      process.nextTick(() => {
        this.amqpConnection.publish(
          ExchangeName.APPOINTMENT_EVENTS,
          RoutingKey.APPOINTMENT_CANCELLED,
          { appointmentId, userId },
        ).then(() =>
          this.logger.log(`Published 'appointment.cancelled' event for appointment ${appointmentId}`),
        ).catch(err =>
          this.logger.error(`Failed to publish appointment.cancelled event`, err.stack),
        );
      });

      return true;
    });
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async calculateQueueNumber(
    manager: EntityManager,
    clinicId: string,
    appointmentDate: dayjs.Dayjs,
  ): Promise<number> {
    const startOfDay = appointmentDate.startOf('day').toDate();
    const endOfDay = appointmentDate.endOf('day').toDate();

    const countForDay = await manager.count(Appointment, {
      where: { clinicId, appointmentTime: Between(startOfDay, endOfDay) },
    });
    return countForDay + 1;
  }

  private async createAppointment(
    userId: string,
    input: Partial<BookByClinicInput & BookByDoctorInput>,
    type: AppointmentType,
  ): Promise<Appointment> {
    const identity = await this.tenantApiClient.getIdentityByUserId(userId);
    if (!identity || !this.isIdentityComplete(identity)) {
      throw new BadRequestException('Vui lòng hoàn tất thông tin danh tính trước khi đặt lịch.');
    }

    const appointmentDate = dayjs(input.appointmentTime).tz(this.tz);

    return this.dataSource.transaction(async (manager) => {
      let queueNumber = 1;
      if (type === AppointmentType.CLINIC && input.clinicId) {
        queueNumber = await this.calculateQueueNumber(manager, input.clinicId, appointmentDate);
      }

      const newAppointment = manager.create(Appointment, {
        userId: identity.userId,
        appointmentType: type,
        clinicId: input.clinicId,
        doctorId: input.doctorId,
        appointmentTime: appointmentDate.toDate(),
        queueNumber,
        patientName: identity.fullName,
        patientPhone: identity.phoneNumber,
        patientGender: identity.gender,
        birthYear: identity.birthYear,
        notes: input.notes,
      });

      const savedAppointment = await manager.save(newAppointment);

      // publish event sau khi commit transaction
      process.nextTick(() => {
        this.amqpConnection.publish(
          ExchangeName.APPOINTMENT_EVENTS,
          RoutingKey.APPOINTMENT_BOOKED,
          {
            appointmentId: savedAppointment.id,
            userId: savedAppointment.userId,
            clinicId: savedAppointment.clinicId,
            doctorId: savedAppointment.doctorId,
            appointmentTime: savedAppointment.appointmentTime,
          },
        ).then(() =>
          this.logger.log(`Published 'appointment.booked' event for appointment ${savedAppointment.id}`),
        ).catch(err =>
          this.logger.error(`Failed to publish appointment.booked event`, err.stack),
        );
      });

      return savedAppointment;
    });
  }

  private isIdentityComplete(identity: any): boolean {
    return !!identity.fullName && !!identity.dob && !!identity.gender && !!identity.phoneNumber;
  }
}
