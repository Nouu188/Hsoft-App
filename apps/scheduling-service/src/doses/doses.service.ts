import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Dose, DoseStatus } from './entities/dose.entity';
import { UpdateDoseInput } from './dto/update-dose.input';

export class DosesService {
  constructor(
    @InjectRepository(Dose)
    private doseRepository: Repository<Dose>,
  ) { }

  async updateDoses(user_id: string, updates: UpdateDoseInput[]): Promise<Dose[]> {
    const logger = new Logger('DosesService');

    logger.debug(`updateDoses called with user_id=${user_id}, updates=${JSON.stringify(updates)}`);

    if (!updates || updates.length === 0) {
      logger.warn(`No update data provided for user_id=${user_id}`);
      throw new BadRequestException('No update data provided.');
    }

    const doseIds = updates.map(u => u.id);
    logger.debug(`Dose IDs to update: ${doseIds.join(', ')}`);

    const dosesToUpdate = await this.doseRepository.findBy({
      id: In(doseIds),
      user_id: user_id,
    });

    logger.debug(`Found ${dosesToUpdate.length} doses in DB for user_id=${user_id}`);

    if (dosesToUpdate.length !== doseIds.length) {
      logger.error(`Mismatch in doses count. Expected ${doseIds.length}, found ${dosesToUpdate.length}. Possibly unauthorized update attempt.`);
      throw new UnauthorizedException('You are trying to update doses that do not exist or you do not own.');
    }

    const updatedDoseEntities: Dose[] = [];
    for (const dose of dosesToUpdate) {
      const updateData = updates.find(u => u.id === dose.id)!.data;

      Object.assign(dose, updateData);

      if (updateData.status === DoseStatus.TAKEN) {
        dose.taken_at = new Date();
        dose.skipReasonCategory = null;
        dose.skipReasonDetail = null;
      } else if (updateData.status === DoseStatus.SKIPPED) {
        dose.taken_at = undefined;
      } else {
        dose.skipReasonCategory = null;
        dose.skipReasonDetail = null;
      }

      updatedDoseEntities.push(dose);
    }

    return this.doseRepository.save(updatedDoseEntities);
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

  async updateDoseStatus(user_id: string, dose_id: string, status: DoseStatus): Promise<Dose> {
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