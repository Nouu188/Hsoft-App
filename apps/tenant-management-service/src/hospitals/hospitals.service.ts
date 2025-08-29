import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateHospitalInput } from './dto/create-hospital.input';
import { UpdateHospitalInput } from './dto/update-hospital.input';
import { Hospital } from './entities/hospital.entity';

@Injectable()
export class HospitalsService {
  private readonly logger = new Logger(HospitalsService.name);

  constructor(
    @InjectRepository(Hospital, 'tenantConnection') private readonly hospitalRepository: Repository<Hospital>,
    @InjectDataSource('tenantConnection') private readonly dataSource: DataSource,
  ) { }

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

  async findAll(isActive?: boolean): Promise<Hospital[]> {
    this.logger.debug(`Fetching all hospitals. Filter active: ${isActive}`);
    return this.hospitalRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Hospital> {
    this.logger.debug(`Fetching hospital with ID: ${id}`);
    const hospital = await this.hospitalRepository.findOneBy({ id });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found.`);
    }
    return hospital;
  }

  async getHospitalUrlByCode(externalCode: string): Promise<string> {
    this.logger.debug(`Fetching GraphQL endpoint for hospital code=${externalCode}`);

    const hospital = await this.hospitalRepository.findOne({
      where: { externalCode },
      select: ['graphqlEndpoint'],
    });

    if (!hospital) {
      throw new NotFoundException(
        `Hospital with externalCode ${externalCode} not found.`,
      );
    }

    return hospital.graphqlEndpoint;
  }

  async getHospitalByCode(
    externalCode: string,
    options?: { selectFields?: (keyof Hospital)[] },
  ): Promise<Hospital> {
    this.logger.debug(`Fetching hospital by externalCode=${externalCode}`);

    try {
      const query = this.hospitalRepository.createQueryBuilder('hospital')
        .where('hospital.externalCode = :externalCode', { externalCode });

      if (options?.selectFields && options.selectFields.length > 0) {
        query.select(options.selectFields.map(field => `hospital.${field}`));
      }

      const hospital = await query.getOne();

      if (!hospital) {
        this.logger.warn(`Hospital not found for externalCode=${externalCode}`);
        throw new NotFoundException(
          `Hospital with externalCode ${externalCode} not found.`,
        );
      }

      this.logger.debug(`Found hospital: id=${hospital.id}, name=${hospital.name}`);
      return hospital;
    } catch (error) {
      this.logger.error(
        `Error fetching hospital by externalCode=${externalCode}: ${error.message}`,
        error.stack,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch hospital');
    }
  }

  async getPlainExternalCode(externalCode: string): Promise<string> {
    const hospital = await this.hospitalRepository.findOne({
      where: { externalCode },
      select: ['id', 'name', 'plainExternalCode'],
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with externalCode=${externalCode} not found`);
    }

    return hospital.plainExternalCode;
  }

  // ============================================================
  // MUTATIONS (WRITE - with transaction)
  // ============================================================

  async create(createHospitalInput: CreateHospitalInput): Promise<Hospital> {
    this.logger.log(`Creating a new hospital: ${createHospitalInput.name}`);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const newHospital = manager.create(Hospital, createHospitalInput);
        return manager.save(Hospital, newHospital);
      });
    } catch (error) {
      this.logger.error('Failed to create hospital', error.stack);
      throw new InternalServerErrorException('Failed to create hospital');
    }
  }

  async update(updateHospitalInput: UpdateHospitalInput): Promise<Hospital> {
    const { id, ...updateData } = updateHospitalInput;
    this.logger.log(`Updating hospital with ID: ${id}`);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const hospital = await manager.preload(Hospital, {
          id: id,
          ...updateData,
        });

        if (!hospital) {
          throw new NotFoundException(
            `Hospital with ID ${id} not found to update.`,
          );
        }

        return manager.save(Hospital, hospital);
      });
    } catch (error) {
      this.logger.error(`Failed to update hospital id=${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<boolean> {
    this.logger.log(`Removing hospital with ID: ${id}`);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const result = await manager.delete(Hospital, id);
        if (result.affected === 0) {
          throw new NotFoundException(
            `Hospital with ID ${id} not found to remove.`,
          );
        }
        return true;
      });
    } catch (error) {
      this.logger.error(`Failed to remove hospital id=${id}`, error.stack);
      throw error;
    }
  }
}
