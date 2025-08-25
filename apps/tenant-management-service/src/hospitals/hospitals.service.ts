import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalInput } from './dto/create-hospital.input';
import { UpdateHospitalInput } from './dto/update-hospital.input';

@Injectable()
export class HospitalsService {
  private readonly logger = new Logger(HospitalsService.name);

  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
  ) {}

  async create(createHospitalInput: CreateHospitalInput): Promise<Hospital> {
    this.logger.log(`Creating a new hospital: ${createHospitalInput.name}`);
    const newHospital = this.hospitalRepository.create(createHospitalInput);
    return this.hospitalRepository.save(newHospital);
  }

  async findAll(isActive?: boolean): Promise<Hospital[]> {
    this.logger.debug(`Fetching all hospitals. Filter active: ${isActive}`);
    const where = typeof isActive === 'boolean' ? { isActive } : {};
    return this.hospitalRepository.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Hospital> {
    this.logger.debug(`Fetching hospital with ID: ${id}`);
    const hospital = await this.hospitalRepository.findOneBy({ id });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found.`);
    }
    return hospital;
  }

  async update(updateHospitalInput: UpdateHospitalInput): Promise<Hospital> {
    const { id, ...updateData } = updateHospitalInput;
    this.logger.log(`Updating hospital with ID: ${id}`);
    
    // Dùng preload để lấy entity hiện tại và merge dữ liệu mới
    const hospital = await this.hospitalRepository.preload({
      id: id,
      ...updateData,
    });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found to update.`);
    }
    return this.hospitalRepository.save(hospital);
  }

  async remove(id: string): Promise<boolean> {
    this.logger.log(`Removing hospital with ID: ${id}`);
    const result = await this.hospitalRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Hospital with ID ${id} not found to remove.`);
    }
    return true;
  }
}