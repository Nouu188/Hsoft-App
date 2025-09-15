import {
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import {
    GetAllDoctorsQuery,
    GetAvailableDoctorsQuery,
    GetDoctorByIdQuery,
} from 'apps/tenant-management-service/src/application/queries/doctors';
import {
    DoctorAvailability,
    DoctorAvailabilityInput,
    DoctorObjectType,
} from 'apps/tenant-management-service/src/domain';

@Resolver(() => DoctorObjectType)
export class DoctorsResolver {
    private readonly logger = new Logger(DoctorsResolver.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Query(() => [DoctorObjectType], {
        name: 'allDoctors',
        description: 'Lấy danh sách tất cả bác sĩ',
    })
    async getAllDoctors(): Promise<DoctorObjectType[]> {
        try {
            this.logger.log(`Fetching all doctors`);
            return await this.queryBus.execute(new GetAllDoctorsQuery());
        } catch (error) {
            this.logger.error(`Failed to fetch doctors`, error.stack);
            throw new InternalServerErrorException('Could not fetch doctors');
        }
    }

    @Query(() => DoctorObjectType, {
        name: 'doctorById',
        description: 'Lấy thông tin bác sĩ theo ID',
    })
    async getDoctorById(
        @Args('doctorId', { type: () => ID }) doctorId: string,
    ): Promise<DoctorObjectType> {
        try {
            this.logger.log(`Fetching doctor with id=${doctorId}`);
            const doctor = await this.queryBus.execute(
                new GetDoctorByIdQuery(doctorId),
            );
            if (!doctor) {
                this.logger.warn(`Doctor not found with id=${doctorId}`);
                throw new NotFoundException(`Doctor with id=${doctorId} not found`);
            }
            return doctor;
        } catch (error) {
            this.logger.error(
                `Failed to fetch doctor id=${doctorId}`,
                error.stack,
            );
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Could not fetch doctor');
        }
    }

    @Query(() => DoctorAvailability, {
        name: 'doctorAvailability',
        description: 'Lấy thông tin lịch trống của bác sĩ',
    })
    async getDoctorAvailability(
        @Args('input') input: DoctorAvailabilityInput,
    ): Promise<DoctorAvailability> {
        try {
            this.logger.log(
                `Fetching availability for doctorId=${input.doctorId}`,
            );
            return await this.queryBus.execute(
                new GetAvailableDoctorsQuery(input),
            );
        } catch (error) {
            this.logger.error(
                `Failed to fetch availability for doctorId=${input.doctorId}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'Could not fetch doctor availability',
            );
        }
    }
}
