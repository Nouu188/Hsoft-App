// apps/appointment-service/src/appointments/appointments.service.ts

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { BookByClinicInput } from './dto/book-appointment.input';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ExchangeName, RoutingKey } from '@app/common/rabbitmq';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly tz = 'Asia/Ho_Chi_Minh'; // Timezone Việt Nam

  constructor(
    @InjectRepository(Appointment, 'appointmentConnection')
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  /**
   * Đặt lịch hẹn mới theo phòng khám.
   */
  async bookByClinic(userId: string, input: BookByClinicInput): Promise<Appointment> {
    this.logger.log(`User ${userId} is booking an appointment for clinic ${input.clinicId}`);
    
    const appointmentDate = dayjs(input.appointmentTime).tz(this.tz);
    const startOfDay = appointmentDate.startOf('day').toDate();
    const endOfDay = appointmentDate.endOf('day').toDate();

    // 1. Lấy số thứ tự tiếp theo cho phòng khám và ngày đó một cách chính xác
    const countForDay = await this.appointmentRepository.count({
      where: {
        clinicId: input.clinicId,
        appointmentTime: Between(startOfDay, endOfDay),
      },
    });
    const newQueueNumber = countForDay + 1;

    // 2. Tạo lịch hẹn
    const newAppointment = this.appointmentRepository.create({
      userId,
      appointmentType: AppointmentType.CLINIC,
      clinicId: input.clinicId,
      appointmentTime: appointmentDate.toDate(),
      queueNumber: newQueueNumber,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientGender: input.patientGender,
      patientDob: input.patientDob,
      notes: input.notes,
    });

    const savedAppointment = await this.appointmentRepository.save(newAppointment);
    
    // 3. Phát sự kiện
    this.amqpConnection.publish(
      ExchangeName.APPOINTMENT_EVENTS,
      RoutingKey.APPOINTMENT_BOOKED,
      {
        appointmentId: savedAppointment.id,
        userId: savedAppointment.userId,
        clinicId: savedAppointment.clinicId,
        appointmentTime: savedAppointment.appointmentTime,
        queueNumber: savedAppointment.queueNumber,
      },
    );
    this.logger.log(`Published 'appointment.booked' event for appointment ${savedAppointment.id}`);

    return savedAppointment;
  }

  /**
   * Lấy tất cả lịch hẹn của một người dùng.
   */
  async getMyAppointments(userId: string): Promise<Appointment[]> {
    this.logger.debug(`Fetching all appointments for user ${userId}`);
    return this.appointmentRepository.find({
      where: { userId },
      order: { appointmentTime: 'DESC' },
      relations: ['clinic'], // Tải kèm thông tin phòng khám
    });
  }

  /**
   * Hủy một lịch hẹn.
   */
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
}