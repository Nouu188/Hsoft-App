import { JwtAuthGuard, Role, Roles, RolesGuard } from '@app/auth';
import {
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    UpsertClinicsCommand,
} from 'apps/tenant-management-service/src/application/clinics';
import {
    GetActiveClinicsQuery,
    GetClinicByIdQuery,
} from 'apps/tenant-management-service/src/application/clinics/queries/impl';
import { ClinicObjectType, HospitalClinicInput, UpsertClinicResult } from 'apps/tenant-management-service/src/domain';

@Resolver(() => ClinicObjectType)
export class ClinicsResolver {
    private readonly logger = new Logger(ClinicsResolver.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Query(() => [ClinicObjectType], {
        name: 'activeClinics',
        description:
            'Lấy danh sách tất cả các phòng khám đang hoạt động để người dùng có thể đặt lịch.',
    })
    async getActiveClinics(): Promise<ClinicObjectType[]> {
        try {
            this.logger.log(`Fetching active clinics`);
            return await this.queryBus.execute(new GetActiveClinicsQuery());
        } catch (error) {
            this.logger.error(`Failed to fetch active clinics`, error.stack);
            throw new InternalServerErrorException('Could not fetch clinics');
        }
    }

    @Query(() => ClinicObjectType, {
        name: 'clinicById',
        description: 'Lấy thông tin chi tiết một phòng khám theo ID.',
    })
    async getClinicById(
        @Args('clinicId', { type: () => String }) clinicId: string,
    ): Promise<ClinicObjectType> {
        try {
            this.logger.log(`Fetching clinic with id=${clinicId}`);
            const clinic = await this.queryBus.execute(
                new GetClinicByIdQuery(clinicId),
            );
            if (!clinic) {
                this.logger.warn(`Clinic not found with id=${clinicId}`);
                throw new NotFoundException(`Clinic with id=${clinicId} not found`);
            }
            return clinic;
        } catch (error) {
            this.logger.error(
                `Failed to fetch clinic id=${clinicId}`,
                error.stack,
            );
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Could not fetch clinic');
        }
    }

    @Mutation(() => UpsertClinicResult, {
        name: 'upsertClinics',
        description:
            'Đồng bộ danh sách phòng khám từ dữ liệu bệnh viện (tạo mới, cập nhật, vô hiệu hóa).',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async upsertClinics(
        @Args({
            name: 'hospitalClinics',
            type: () => [HospitalClinicInput],
        })
        inputs: HospitalClinicInput[],
    ): Promise<UpsertClinicResult> {
        try {
            this.logger.log(
                `Upserting ${inputs.length} clinics from hospital data`,
            );
            return await this.commandBus.execute(new UpsertClinicsCommand(inputs));
        } catch (error) {
            this.logger.error(
                `Failed to upsert clinics, count=${inputs.length}`,
                error.stack,
            );
            throw new InternalServerErrorException('Could not upsert clinics');
        }
    }
}
