import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { Logger, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserPayload } from 'apps/account-service/src/domain/users/dtos';
import {
  BookByClinicCommand,
  BookByDoctorCommand,
  CancelAppointmentCommand,
  GetAppointmentsByUserIdQuery
} from 'apps/appointment-service/src/application';
import { AppointmentObjectType, BookByClinicInput, BookByDoctorInput } from 'apps/appointment-service/src/domain/dtos';
import { Appointment } from 'apps/appointment-service/src/domain/entities';
import { ClinicObjectType, DoctorObjectType } from 'apps/tenant-management-service/src/domain';

@Resolver(() => AppointmentObjectType)
@UseGuards(JwtAuthGuard)
export class AppointmentsResolver {
  private readonly logger = new Logger(AppointmentsResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly tenantApiClient: TenantApiClientService,
  ) { }

  @Query(() => [AppointmentObjectType], { name: 'myAppointments' })
  async getMyAppointments(@CurrentUser() user: UserPayload): Promise<Appointment[]> {
    return this.queryBus.execute(new GetAppointmentsByUserIdQuery(user.id));
  }

  @Mutation(() => Boolean, { description: 'Hủy một lịch hẹn đã đặt.' })
  async cancelAppointment(
    @CurrentUser() user: UserPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.commandBus.execute(new CancelAppointmentCommand(user.id, id));
  }

  @Mutation(() => [AppointmentObjectType], { description: 'Đặt lịch theo danh sách phòng khám.' })
  async bookByClinic(
    @CurrentUser() user: UserPayload,
    @Args({ name: 'inputs', type: () => [BookByClinicInput] }) inputs: BookByClinicInput[],
  ): Promise<Appointment[]> {
    if (!inputs || inputs.length === 0) {
      throw new Error('Không có dữ liệu lịch hẹn để đặt.');
    }

    return this.commandBus.execute(new BookByClinicCommand(user.id, inputs));
  }

  @Mutation(() => [AppointmentObjectType], { description: 'Đặt lịch theo danh sách bác sĩ.' })
  async bookByDoctor(
    @CurrentUser() user: UserPayload,
    @Args({ name: 'inputs', type: () => [BookByDoctorInput] }) inputs: BookByDoctorInput[],
  ): Promise<Appointment[]> {
    if (!inputs || inputs.length === 0) {
      throw new Error('Không có dữ liệu lịch hẹn để đặt.');
    }

    return this.commandBus.execute(new BookByDoctorCommand(user.id, inputs));
  }

  @ResolveField(() => ClinicObjectType, { nullable: true })
  async clinic(@Parent() appointment: Appointment): Promise<ClinicObjectType> {
    return this.tenantApiClient.getClinicById(appointment.clinicId);
  }

  @ResolveField(() => DoctorObjectType, { nullable: true })
  async doctor(@Parent() appointment: Appointment): Promise<DoctorObjectType | null> {
    if (!appointment.doctorId) return null;
    return this.tenantApiClient.getDoctorById(appointment.doctorId);
  }
}
