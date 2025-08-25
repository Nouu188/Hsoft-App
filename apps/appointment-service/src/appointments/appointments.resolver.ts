import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserPayload } from 'apps/account-service/src/users/dto/user.payload';
import { ClinicObjectType } from '../clinics/dto/clinic.object-type';
import { Clinic } from '../clinics/entities/clinic.entity';
import { DoctorObjectType } from '../doctors/dto/doctor.object-type';
import { Doctor } from '../doctors/entities/doctor.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentObjectType } from './dto/appointment.object-type';
import { BookByClinicInput, BookByDoctorInput } from './dto/book-appointment.input';
import { ConnectionStatus, HospitalConnectionStatusObjectType } from './dto/hospital-connection-status.object-type';
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

  @Query(() => [HospitalConnectionStatusObjectType], { name: 'hospitalsWithConnectionStatus', description: 'Lấy những bệnh viện đã được liên kết với tài khoản' })
  async getHospitalsWithConnectionStatus(@CurrentUser() user: UserPayload): Promise<HospitalConnectionStatusObjectType[]> {
    this.logger.log(`Fetching hospital list with connection status for user ${user.id}`);

    const [allHospitals, userConnections] = await Promise.all([
      this.tenantApiClient.getActiveHospitals(),
      this.accountApiClient.getMyConnections(user.id),
    ]);

    const userConnectedHospitalIds = new Set(userConnections.map(c => c.hospitalId));

    return allHospitals.map(hospital => ({
      ...hospital,
      connectionStatus: userConnectedHospitalIds.has(hospital.id) ? ConnectionStatus.LINKED : ConnectionStatus.NOT_LINKED,
    }));
  }

  // MUTATIONS

  @Mutation(() => [AppointmentObjectType], { description: 'Đặt lịch hẹn theo nhiều phòng khám.' })
  async bookAppointmentsByClinics(
    @CurrentUser() user: UserPayload,
    @Args({ name: 'inputs', type: () => [BookByClinicInput] }) inputs: BookByClinicInput[],
  ): Promise<Appointment[]> {
    this.logger.log(`User ${user.id} is booking multiple appointments by clinics`);

    // đảm bảo đã liên kết với bệnh viện cho từng request
    await Promise.all(inputs.map(input => this.accountApiClient.ensureHospitalLink(user.id, input.hospitalId)));

    return this.appointmentsService.bookByClinics(user, inputs);
  }

  @Mutation(() => [AppointmentObjectType], { description: 'Đặt lịch hẹn theo nhiều bác sĩ.' })
  async bookAppointmentsByDoctors(
    @CurrentUser() user: UserPayload,
    @Args({ name: 'inputs', type: () => [BookByDoctorInput] }) inputs: BookByDoctorInput[],
  ): Promise<Appointment[]> {
    this.logger.log(`User ${user.id} is booking multiple appointments by doctors`);

    await Promise.all(inputs.map(input => this.accountApiClient.ensureHospitalLink(user.id, input.hospitalId)));

    return this.appointmentsService.bookByDoctors(user, inputs);
  }

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
  async clinic(@Parent() appointment: Appointment): Promise<Clinic | null> {
    return appointment.clinic ?? null;
  }

  @ResolveField(() => DoctorObjectType, { nullable: true })
  async doctor(@Parent() appointment: Appointment): Promise<Doctor | null> {
    return appointment.doctor ?? null;
  }
}