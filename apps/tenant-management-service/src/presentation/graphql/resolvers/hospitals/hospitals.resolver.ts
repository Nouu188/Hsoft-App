import { JwtAuthGuard, Role, Roles, RolesGuard } from '@app/auth';
import {
    BadRequestException,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    CreateHospitalCommand,
    RemoveHospitalCommand,
    UpdateHospitalCommand,
} from 'apps/tenant-management-service/src/application/hospitals/commands/impl';
import {
    GetAllHospitalsQuery,
    GetHospitalByExternalCodeQuery,
    GetHospitalByIdQuery,
} from 'apps/tenant-management-service/src/application/hospitals/queries';
import { CreateHospitalInput, Hospital, HospitalPayload, UpdateHospitalInput } from 'apps/tenant-management-service/src/domain';

@Resolver()
export class HospitalsResolver {
    private readonly logger = new Logger(HospitalsResolver.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Query(() => [HospitalPayload], { name: 'hospitals' })
    async findAll(): Promise<HospitalPayload[]> {
        try {
            return await this.queryBus.execute(new GetAllHospitalsQuery());
        } catch (error) {
            this.handleError('fetch hospitals', error);
        }
    }

    @Query(() => Hospital, { name: 'hospital' })
    @UseGuards(JwtAuthGuard)
    async findOne(@Args('id', { type: () => ID }) id: string): Promise<Hospital> {
        try {
            return await this.queryBus.execute(new GetHospitalByIdQuery(id));
        } catch (error) {
            this.handleError(`fetch hospital id=${id}`, error, [NotFoundException]);
        }
    }

    @Query(() => HospitalPayload, { name: 'hospitalByExternalCode' })
    @UseGuards(JwtAuthGuard)
    async getHospitalByExternalCode(
        @Args('externalCode', { type: () => String }) externalCode: string,
    ): Promise<HospitalPayload> {
        try {
            return await this.queryBus.execute(
                new GetHospitalByExternalCodeQuery(externalCode),
            );
        } catch (error) {
            this.handleError(
                `fetch hospital by externalCode=${externalCode}`,
                error,
                [NotFoundException, BadRequestException],
            );
        }
    }

    @Mutation(() => HospitalPayload)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async createHospital(
        @Args('createHospitalInput') createHospitalInput: CreateHospitalInput,
    ): Promise<HospitalPayload> {
        try {
            this.logger.debug(
                `Creating hospital with data: ${JSON.stringify(createHospitalInput)}`,
            );
            return await this.commandBus.execute(
                new CreateHospitalCommand(createHospitalInput),
            );
        } catch (error) {
            this.handleError(
                `create hospital name=${createHospitalInput.name}`,
                error,
            );
        }
    }

    @Mutation(() => Hospital)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async updateHospital(
        @Args('updateHospitalInput') updateHospitalInput: UpdateHospitalInput,
    ): Promise<Hospital> {
        try {
            this.logger.debug(
                `Updating hospital id=${updateHospitalInput.id} with data=${JSON.stringify(updateHospitalInput)}`,
            );
            return await this.commandBus.execute(
                new UpdateHospitalCommand(updateHospitalInput),
            );
        } catch (error) {
            this.handleError(
                `update hospital id=${updateHospitalInput.id}`,
                error,
                [NotFoundException],
            );
        }
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async removeHospital(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<boolean> {
        try {
            return await this.commandBus.execute(new RemoveHospitalCommand(id));
        } catch (error) {
            this.handleError(`remove hospital id=${id}`, error, [NotFoundException]);
        }
    }

    // --- Private helper ---
    private handleError(
        action: string,
        error: unknown,
        expectedExceptions: Function[] = [],
    ): never {
        this.logger.error(`Failed to ${action}`, (error as Error).stack);
        if (expectedExceptions.some((ex) => error instanceof ex)) {
            throw error;
        }
        throw new InternalServerErrorException(`Could not ${action}`);
    }
}
