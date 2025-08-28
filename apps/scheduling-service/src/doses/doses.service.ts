import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository, DataSource } from 'typeorm';
import { Dose, DoseStatus } from './entities/dose.entity';
import { UpdateDoseInput } from './dto/update-dose.input';

@Injectable()
export class DosesService {
  private readonly logger = new Logger(DosesService.name);

  constructor(
    @InjectRepository(Dose)
    private readonly doseRepository: Repository<Dose>,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

  async findById(doseId: string, userId: string): Promise<Dose | null> {
    this.logger.debug(`Finding dose ${doseId} for user ${userId}`);
    return this.doseRepository.findOne({
      where: { id: doseId, userId },
    });
  }

  async findDosesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Dose[]> {
    if (!userId || !startDate || !endDate) {
      throw new BadRequestException('userId, startDate, and endDate are required.');
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    return this.doseRepository.find({
      where: { userId, due_at: Between(startDate, endDate) },
      order: { due_at: 'ASC' },
    });
  }

  // ============================================================
  // MUTATIONS (WRITE - with transaction)
  // ============================================================

  async updateDoses(userId: string, updates: UpdateDoseInput[]): Promise<Dose[]> {
    if (!updates || updates.length === 0) {
      this.logger.warn(`No update data provided for userId=${userId}`);
      throw new BadRequestException('No update data provided.');
    }

    return this.dataSource.transaction(async (manager) => {
      const doseIds = updates.map((u) => u.id);
      this.logger.debug(`Updating doses: ${doseIds.join(', ')} for userId=${userId}`);

      const dosesToUpdate = await manager.find(Dose, {
        where: { id: In(doseIds), userId },
      });

      if (dosesToUpdate.length !== doseIds.length) {
        throw new UnauthorizedException(
          'You are trying to update doses that do not exist or you do not own.',
        );
      }

      for (const dose of dosesToUpdate) {
        const updateData = updates.find((u) => u.id === dose.id)!.data;

        if (updateData.due_at) {
          updateData.due_at = new Date(updateData.due_at);
        }

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
      }

      return manager.save(dosesToUpdate);
    });
  }

  async updateDoseStatus(userId: string, doseId: string, status: DoseStatus): Promise<Dose> {
    if (![DoseStatus.TAKEN, DoseStatus.SKIPPED].includes(status)) {
      throw new BadRequestException('Invalid status. Only TAKEN or SKIPPED are allowed.');
    }

    return this.dataSource.transaction(async (manager) => {
      const dose = await manager.findOne(Dose, { where: { id: doseId, userId } });

      if (!dose) {
        throw new UnauthorizedException(
          `Dose not found or you don't have permission to access it.`,
        );
      }

      dose.status = status;
      dose.taken_at = status === DoseStatus.TAKEN ? new Date() : undefined;

      return manager.save(dose);
    });
  }
}
