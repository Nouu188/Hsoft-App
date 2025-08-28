import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { DoctorsService } from './doctors.service';
import { DoctorAvailabilityInput } from './dto/doctor-availability.input';
import { DoctorAvailability } from './dto/doctor-availability.object-type';
import { DoctorObjectType } from './dto/doctor.object-type';

@Resolver(() => DoctorObjectType)
export class DoctorsResolver {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Query(() => [DoctorObjectType], { 
    name: 'doctors',
    description: 'Lấy danh sách bác sĩ, có thể lọc theo phòng khám.'
  })
  async getDoctors(
    @Args('clinicId', { type: () => ID, nullable: true })
    clinicId?: string,
  ): Promise<DoctorObjectType[]> {
    return this.doctorsService.findAll(clinicId);
  }

  @Query(() => DoctorObjectType, { 
    name: 'doctors',
    description: 'Lấy bác sĩ theo ID'
  })
  async getDoctorByIds(
    @Args('doctorId', { type: () => ID  })
    doctorId: string,
  ): Promise<DoctorObjectType> {
    return this.doctorsService.findOneById(doctorId);
  }

  @Query(() => DoctorAvailability, { name: 'doctorAvailability' })
  async getDoctorAvailability(
    @Args('input') input: DoctorAvailabilityInput,
  ): Promise<DoctorAvailability> {
    return this.doctorsService.getDoctorAvailability(input.doctorId, input.date);
  }
}