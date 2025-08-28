import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserPayload } from 'apps/account-service/src/users/dto/user.payload';
import { ClinicObjectType } from 'apps/tenant-management-service/src/clinics/dto/clinic.object-type';
import { DoctorObjectType } from '../../../tenant-management-service/src/doctors/dto/doctor.object-type';
import { AppointmentsService } from './appointments.service';
import { AppointmentObjectType } from './dto/appointment.object-type';
import { BookByClinicInput, BookByDoctorInput } from './dto/book-appointment.input';
import { Appointment } from './entities/appointment.entity';

@Resolver(() => AppointmentObjectType)
@UseGuards(JwtAuthGuard)
export class AppointmentsResolver {
  private readonly logger = new Logger(AppointmentsResolver.name);

  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly accountApiClient: AccountApiClientService,
    private readonly tenantApiClient: TenantApiClientService,
  ) { }

  // QUERIES

  @Query(() => [AppointmentObjectType], { name: 'myAppointments' })
  async getMyAppointments(@CurrentUser() user: UserPayload): Promise<Appointment[]> {
    return this.appointmentsService.getMyAppointments(user.id);
  }

  // MUTATIONS
  @Mutation(() => Boolean, { description: 'Hủy một lịch hẹn đã đặt.' })
  async cancelAppointment(
    @CurrentUser() user: UserPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.appointmentsService.cancelAppointment(user.id, id);
  }

  // ===================================================================
  // FIELD RESOLVERS
  // ===================================================================

  @ResolveField(() => ClinicObjectType, { nullable: true })
  async clinic(@Parent() appointment: Appointment): Promise<ClinicObjectType> {
    return this.tenantApiClient.getClinicById(appointment.clinicId);
  }

  @ResolveField(() => DoctorObjectType, { nullable: true })
  async doctor(@Parent() appointment: Appointment): Promise<DoctorObjectType | null> {
    return this.tenantApiClient.getDoctorById(appointment.doctorId)
  }
}