import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles, Role } from '@app/auth'; // Import từ libs
import { HospitalsService } from './hospitals.service';
import { HospitalObjectType } from './dto/hospital.object-type';
import { CreateHospitalInput } from './dto/create-hospital.input';
import { UpdateHospitalInput } from './dto/update-hospital.input';

@Resolver(() => HospitalObjectType)
export class HospitalsResolver {
  constructor(private readonly hospitalsService: HospitalsService) {}

// -- QUERY

  @Query(() => [HospitalObjectType], { name: 'hospitals' })
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles(Role.ADMIN) 
  findAll(@Args('isActive', { type: () => Boolean, nullable: true }) isActive?: boolean) {
    return this.hospitalsService.findAll(isActive);
  }
  
  @Query(() => [HospitalObjectType], { name: 'activeHospitals' })
  @UseGuards(JwtAuthGuard)
  findAllActive() {
    return this.hospitalsService.findAll(true);
  }

  @Query(() => HospitalObjectType, { name: 'hospital' })
  @UseGuards(JwtAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.hospitalsService.findOne(id);
  }

// -- MUTATION

  @Mutation(() => HospitalObjectType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createHospital(@Args('createHospitalInput') createHospitalInput: CreateHospitalInput) {
    return this.hospitalsService.create(createHospitalInput);
  }

  @Mutation(() => HospitalObjectType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateHospital(@Args('updateHospitalInput') updateHospitalInput: UpdateHospitalInput) {
    return this.hospitalsService.update(updateHospitalInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeHospital(@Args('id', { type: () => ID }) id: string) {
    return this.hospitalsService.remove(id);
  }
}