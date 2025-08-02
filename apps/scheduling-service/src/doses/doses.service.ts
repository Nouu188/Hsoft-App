import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Dose, DoseStatus } from './entities/dose.entity';

export class DosesService {
  constructor(
    @InjectRepository(Dose)
    private doseRepository: Repository<Dose>,
  ) {}

  async findByIds(dose_ids: string[]) {
    return await this.doseRepository.find({
        where: { id: In(dose_ids) },
    });
  }

  async findDosesByDateRange(
    user_id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Dose[]> {
    if (!user_id || !startDate || !endDate) {
      throw new BadRequestException('userId, startDate, and endDate are required.');
    }

    if (startDate > endDate) {
        throw new BadRequestException('startDate cannot be after endDate.');
    }

    const dosesInRange = await this.doseRepository.find({
      where: {
        user_id,
        due_at: Between(startDate, endDate),
      },
      order: {
        due_at: 'ASC',
      },
    });

    return dosesInRange;
  }

  async updateUserDoseStatus(user_id: string, dose_id: string, status: DoseStatus): Promise<Dose> {
    if (status !== DoseStatus.TAKEN && status !== DoseStatus.SKIPPED) {
      throw new BadRequestException('Invalid status. Only TAKEN or SKIPPED are allowed.');
    }
    
    const dose = await this.doseRepository.findOneBy({ 
        id: dose_id,
        user_id,
    });

    if (!dose) {
      throw new UnauthorizedException(`Dose not found or you don't have permission to access it.`);
    }

    dose.status = status;
    dose.taken_at = (status === DoseStatus.TAKEN) ? new Date() : undefined; 
    
    return this.doseRepository.save(dose);
  }
}