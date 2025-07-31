import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dose, DoseStatus } from './entities/dose.entity';

@Injectable()
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

  async updateUserDoseStatus(user_id: string, dose_id: string, status: DoseStatus): Promise<Dose> {
    if (status !== DoseStatus.TAKEN && status !== DoseStatus.SKIPPED) {
      throw new Error('Invalid status update. Only TAKEN or SKIPPED are allowed.');
    }
    
    const dose = await this.doseRepository.findOneBy({ id: dose_id });
    if (!dose) {
      throw new NotFoundException(`Dose with ID ${dose_id} not found.`);
    }

    if (dose.user_id !== user_id) {
      throw new UnauthorizedException('You are not authorized to update this dose.');
    }

    dose.status = status;
    if (status === DoseStatus.TAKEN) {
      dose.taken_at = new Date(); 
    } else {
      dose.taken_at = undefined;
    }
    
    return this.doseRepository.save(dose);
  }
}