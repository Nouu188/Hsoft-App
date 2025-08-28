import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HospitalsService } from '../../hospitals/hospitals.service';
import { CreateIdentityInput } from '../dtos/create-identity-input.dto';
import { Identity } from '../entities/identity.entity';

@Injectable()
export class IdentitiesService {
  private readonly logger = new Logger(IdentitiesService.name);

  constructor(
    @InjectRepository(Identity, 'tenantConnection') private readonly identityRepository: Repository<Identity>,
    private readonly hospitalService: HospitalsService,
  ) { }

  async findOne(id: string): Promise<Identity> {
    this.logger.debug(`Searching Identity by id: ${id}`);
    const identity = await this.identityRepository.findOneBy({ id });
    if (!identity) {
      this.logger.warn(`Identity with id ${id} not found.`);
      throw new NotFoundException(`Identity with ID ${id} not found.`);
    }
    return identity;
  }

  async findMany(ids: string[]): Promise<Identity[]> {
    this.logger.debug(`Searching multiple Identities by ids: [${ids.join(', ')}]`);
    return this.identityRepository.findBy({ id: In(ids) });
  }

  async findByUserId(userId: string): Promise<Identity> {
    this.logger.debug(`Searching Identity by userId: ${userId}`);
    const identity = await this.identityRepository.findOneBy({ userId });
    if (!identity) {
      this.logger.warn(`Identity for userId ${userId} not found.`);
      throw new NotFoundException(`Identity for userId ${userId} not found.`);
    }
    return identity;
  }

  async create(
    payload: CreateIdentityInput,
    userId: string,
    externalHospitalCode?: string,
  ): Promise<Identity> {
    this.logger.debug(
      `Creating/updating Identity for userId=${userId}, phone=${payload.phoneNumber}`,
    );

    const cleanPayload: CreateIdentityInput = {
      ...payload,
      phoneNumber: payload.phoneNumber?.trim(),
      nationalId: payload.nationalId?.trim(),
      fullName: payload.fullName?.trim() || 'Unknown',
      hospitals: payload.hospitals ?? [],
    };

    try {
      let identity = await this.identityRepository.findOne({
        where: { userId },
        relations: ['hospitals'],
      });

      if (externalHospitalCode) {
        const hospital = await this.hospitalService.getHospitalByCode(externalHospitalCode);
        if (hospital && !cleanPayload.hospitals.some(h => h.id === hospital.id)) {
          cleanPayload.hospitals.push(hospital);
        }
      }

      if (identity) {
        Object.assign(identity, cleanPayload);
        this.logger.debug(`[IdentitiesService] Updating existing Identity id=${identity.id}`);
      } else {
        identity = this.identityRepository.create({
          ...cleanPayload,
          userId,
        });
        this.logger.debug(`[IdentitiesService] Creating new Identity for userId=${userId}`);
      }

      const saved = await this.identityRepository.save(identity);

      this.logger.log(
        `[IdentitiesService] Successfully saved Identity id=${saved.id} for userId=${userId}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(
        `[IdentitiesService] Failed to save Identity for userId=${userId}. Error: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to save Identity');
    }
  }
}
