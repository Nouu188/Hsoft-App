import { JwtAuthGuard, Role, Roles, RolesGuard } from '@app/auth';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateHospitalInput } from './dto/create-hospital.input';
import { UpdateHospitalInput } from './dto/update-hospital.input';
import { HospitalsService } from './hospitals.service';
import { HospitalUrlResponse } from './dto/hospital-url-response.object-type';
import { HospitalPayload } from './dto/hospital.payload';
import { Hospital } from './entities/hospital.entity';

@Resolver()
export class HospitalsResolver {
  private readonly logger = new Logger(HospitalsResolver.name);

  constructor(private readonly hospitalsService: HospitalsService) { }

  // ============================================================
  // QUERIES
  // ============================================================

  @Query(() => [HospitalPayload], { name: 'hospitals' })
  async findAll(
    @Args('isActive', { type: () => Boolean, nullable: true }) isActive?: boolean,
  ) {
    try {
      return await this.hospitalsService.findAll(isActive);
    } catch (error) {
      this.logger.error(`Failed to fetch hospitals`, error.stack);
      throw new InternalServerErrorException('Could not fetch hospitals');
    }
  }

  @Query(() => [Hospital], { name: 'activeHospitals' })
  @UseGuards(JwtAuthGuard)
  async findAllActive() {
    try {
      return await this.hospitalsService.findAll(true);
    } catch (error) {
      this.logger.error(`Failed to fetch active hospitals`, error.stack);
      throw new InternalServerErrorException('Could not fetch active hospitals');
    }
  }

  @Query(() => Hospital, { name: 'hospital' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    try {
      return await this.hospitalsService.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to fetch hospital id=${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not fetch hospital');
    }
  }

  @Query(() => HospitalPayload, { name: 'hospitalByExternalCode' })
  @UseGuards(JwtAuthGuard)
  async getHospitalByExternalCode(
    @Args('externalCode', { type: () => String }) externalCode: string,
  ): Promise<HospitalPayload> {
    try {
      const hospital = await this.hospitalsService.getHospitalByCode(externalCode);
      return hospital;
    } catch (error) {
      this.logger.error(
        `Failed to fetch hospital for code=${externalCode}`,
        error.stack,
      );
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Could not fetch hospital URL');
    }
  }

  // ============================================================
  // MUTATIONS
  // ============================================================

  @Mutation(() => HospitalPayload)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createHospital(
    @Args('createHospitalInput') createHospitalInput: CreateHospitalInput,
  ) {
    try {
      return await this.hospitalsService.create(createHospitalInput);
    } catch (error) {
      this.logger.error(
        `Failed to create hospital: ${createHospitalInput.name}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create hospital');
    }
  }

  @Mutation(() => Hospital)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateHospital(
    @Args('updateHospitalInput') updateHospitalInput: UpdateHospitalInput,
  ) {
    try {
      return await this.hospitalsService.update(updateHospitalInput);
    } catch (error) {
      this.logger.error(
        `Failed to update hospital id=${updateHospitalInput.id}`,
        error.stack,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not update hospital');
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async removeHospital(@Args('id', { type: () => ID }) id: string) {
    try {
      return await this.hospitalsService.remove(id);
    } catch (error) {
      this.logger.error(`Failed to remove hospital id=${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not remove hospital');
    }
  }
}
