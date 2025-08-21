import { Resolver, Query, Mutation, Args, ID, Parent, ResolveField } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@app/auth';
import { AppointmentsService } from './appointments.service';
import { AppointmentObjectType } from './dto/appointment.object-type';
import { BookByClinicInput } from './dto/book-appointment.input';
import { Appointment } from './entities/appointment.entity';
import dayjs from 'dayjs';
import { UserResponseDto } from 'apps/account-service/src/auth/dto/login.response';
import { ClinicsService } from '../clinics/clinics.service';
import { ClinicObjectType } from '../clinics/dto/clinic.object-type';

@Resolver(() => AppointmentObjectType)
@UseGuards(JwtAuthGuard)
export class AppointmentsResolver {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    // Inject ClinicsService để có thể resolve field
    private readonly clinicsService: ClinicsService,
  ) {}

  @Query(() => [AppointmentObjectType], { name: 'myAppointments' })
  async getMyAppointments(@CurrentUser() user: UserResponseDto): Promise<Appointment[]> {
    return this.appointmentsService.getMyAppointments(user.id);
  }

  @Mutation(() => AppointmentObjectType)
  async bookAppointmentByClinic(
    @CurrentUser() user: UserResponseDto,
    @Args('input') input: BookByClinicInput,
  ): Promise<Appointment> {
    // Thêm logic validate, ví dụ: không cho đặt lịch trong quá khứ
    if (dayjs(input.appointmentTime).isBefore(dayjs())) {
        throw new BadRequestException('Không thể đặt lịch hẹn trong quá khứ.');
    }
    return this.appointmentsService.bookByClinic(user.id, input);
  }

  @Mutation(() => Boolean, { description: 'Hủy một lịch hẹn đã đặt.' })
  async cancelAppointment(
    @CurrentUser() user: UserResponseDto,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.appointmentsService.cancelAppointment(user.id, id);
  }

  @ResolveField('clinic', () => ClinicObjectType, { nullable: true })
  async getClinic(@Parent() appointment: Appointment): Promise<ClinicObjectType | null> {
    if (!appointment.clinicId) return null;
    // TypeORM đã tải sẵn relation này, nhưng nếu không, bạn có thể gọi service ở đây
    return appointment.clinic;
  }
}