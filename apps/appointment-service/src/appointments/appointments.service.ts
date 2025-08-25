import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { BookByClinicInput, BookByDoctorInput } from './dto/book-appointment.input';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ExchangeName, RoutingKey } from '@app/common/rabbitmq';
import { UserPayload } from 'apps/account-service/src/users/dto/user.payload';
import { PatientIdentityApiClientService } from '@app/api-clients/identity/identity-api-client.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly tz = 'Asia/Ho_Chi_Minh';

  constructor(
    @InjectRepository(Appointment, 'appointmentConnection') private readonly appointmentRepository: Repository<Appointment>,
    
    private readonly amqpConnection: AmqpConnection,
    private readonly identityApiClient: PatientIdentityApiClientService,
  ) { }

  private async createAppointment(
    user: UserPayload,
    input: Partial<BookByClinicInput & BookByDoctorInput>,
    type: AppointmentType,
  ): Promise<Appointment> {
    // 1. Kiểm tra danh tính
    const identity = await this.identityApiClient.getMyIdentity();
    if (!identity || !this.isIdentityComplete(identity)) {
      throw new BadRequestException('Vui lòng hoàn tất thông tin danh tính trước khi đặt lịch.');
    }

    const appointmentDate = dayjs(input.appointmentTime).tz(this.tz);

    // 2. Số thứ tự (nếu theo phòng khám)
    let queueNumber = 1;
    if (type === AppointmentType.CLINIC && input.clinicId) {
      const startOfDay = appointmentDate.startOf('day').toDate();
      const endOfDay = appointmentDate.endOf('day').toDate();
      const countForDay = await this.appointmentRepository.count({
        where: { clinicId: input.clinicId, appointmentTime: Between(startOfDay, endOfDay) },
      });
      queueNumber = countForDay + 1;
    }

    // 3. Tạo bản ghi
    const newAppointment = this.appointmentRepository.create({
      userId: user.id,
      appointmentType: type,
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      appointmentTime: appointmentDate.toDate(),
      queueNumber,
      patientName: identity.fullName,
      patientPhone: identity.phoneNumber,
      patientGender: identity.gender,
      patientDob: identity.dob,
      notes: input.notes,
    });

    const savedAppointment = await this.appointmentRepository.save(newAppointment);

    // 4. Publish sự kiện
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
    );
    this.logger.log(`Published 'appointment.booked' event for appointment ${savedAppointment.id}`);

    return savedAppointment;
  }

  async bookByClinics(user: UserPayload, inputs: BookByClinicInput[]): Promise<Appointment[]> {
    this.logger.log(`User ${user.id} is booking ${inputs.length} appointments by clinics.`);
    return Promise.all(
      inputs.map(input => this.createAppointment(user, input, AppointmentType.CLINIC)),
    );
  }

  async bookByDoctors(user: UserPayload, inputs: BookByDoctorInput[]): Promise<Appointment[]> {
    this.logger.log(`User ${user.id} is booking ${inputs.length} appointments by doctors.`);
    // TODO: Thêm logic kiểm tra lịch trống cho mỗi bác sĩ
    return Promise.all(
      inputs.map(input => this.createAppointment(user, input, AppointmentType.DOCTOR)),
    );
  }

  async getMyAppointments(userId: string): Promise<Appointment[]> {
    this.logger.debug(`Fetching all appointments for user ${userId}`);
    return this.appointmentRepository.find({
      where: { userId },
      order: { appointmentTime: 'DESC' },
      relations: ['clinic', 'doctor'],
    });
  }

  async cancelAppointment(userId: string, appointmentId: string): Promise<boolean> {
    this.logger.log(`User ${userId} is attempting to cancel appointment ${appointmentId}`);
    const appointment = await this.appointmentRepository.findOneBy({ id: appointmentId, userId });

    if (!appointment) {
      throw new NotFoundException('Lịch hẹn không tồn tại hoặc bạn không có quyền hủy.');
    }

    // Thêm logic kiểm tra xem có được phép hủy không (ví dụ: không thể hủy lịch đã hoàn thành)
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy lịch hẹn đã hoàn thành.');
    }

    await this.appointmentRepository.update(appointmentId, { status: AppointmentStatus.CANCELLED });

    this.amqpConnection.publish(
      ExchangeName.APPOINTMENT_EVENTS,
      RoutingKey.APPOINTMENT_CANCELLED,
      { appointmentId, userId },
    );
    this.logger.log(`Published 'appointment.cancelled' event for appointment ${appointmentId}`);

    return true;
  }

  private isIdentityComplete(identity: any): boolean {
    return !!identity.fullName && !!identity.dob && !!identity.gender && !!identity.phoneNumber;
  }
}