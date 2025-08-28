import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ClinicsService } from './clinics.service';
import { ClinicObjectType } from './dto/clinic.object-type';
import { UpsertClinicResult } from './dto/upsert-clinic-result.object-type';
import { HospitalClinicInput } from './dto/hospital-clinic.dto';

@Resolver(() => ClinicObjectType)
export class ClinicsResolver {
  constructor(private readonly clinicsService: ClinicsService) { }

  @Query(() => [ClinicObjectType], {
    name: 'activeClinics',
    description: 'Lấy danh sách tất cả các phòng khám đang hoạt động để người dùng có thể đặt lịch.'
  })
  async getActiveClinics(): Promise<ClinicObjectType[]> {
    return this.clinicsService.findAllActive();
  }

  @Query(() => ClinicObjectType, {
    name: 'clinicById',
    description: 'Lấy thông tin chi tiết một phòng khám theo ID.'
  })
  async getClinicById(
    @Args('clinicId', { type: () => String }) clinicId: string,
  ): Promise<ClinicObjectType> {
    return this.clinicsService.getById(clinicId);
  }


  @Mutation(() => UpsertClinicResult, {
    name: 'upsertClinics',
    description: 'Đồng bộ danh sách phòng khám từ dữ liệu bệnh viện (tạo mới, cập nhật, vô hiệu hóa).'
  })
  async upsertClinics(
    @Args({ name: 'hospitalClinics', type: () => [HospitalClinicInput] })
    hospitalClinics: HospitalClinicInput[],
  ): Promise<UpsertClinicResult> {
    return this.clinicsService.upsertClinics(hospitalClinics);
  }
}