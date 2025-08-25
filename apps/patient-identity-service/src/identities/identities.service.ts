import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateIdentityInput } from './dto/create-or-update-identity.input';
import { PatientIdentity } from './entities/patient-identity.entity';

@Injectable()
export class IdentitiesService {
  private readonly logger = new Logger(IdentitiesService.name);

  constructor(
    @InjectRepository(PatientIdentity)
    private readonly identityRepository: Repository<PatientIdentity>,
  ) { }

  async findByUserId(userId: string): Promise<PatientIdentity | null> {
    this.logger.debug(`Fetching identity for user ID: ${userId}`);
    return this.identityRepository.findOneBy({ userId });
  }

  async createOrUpdate(userId: string, input: CreateOrUpdateIdentityInput): Promise<PatientIdentity> {
    this.logger.log(`Upserting identity for user ID: ${userId}`);

    let identity = await this.findByUserId(userId);

    if (identity) {
      this.logger.log(`Found existing identity ${identity.id}. Updating...`);

      Object.assign(identity, input);
    } else {
      this.logger.log(`No existing identity found. Creating new one...`);

      identity = this.identityRepository.create({
        ...input,
        userId,
      });
    }

    try {
      const savedIdentity = await this.identityRepository.save(identity);
      this.logger.log(`Successfully saved identity for user ${userId}`);
      return savedIdentity;
    } catch (error) {
      this.logger.error(`Failed to save identity for user ${userId}`, error.stack);

      if (error.code === '23505') {
        throw new ConflictException('Thông tin CMND/CCCD hoặc BHYT đã được sử dụng.');
      }
      throw new InternalServerErrorException('Không thể lưu thông tin danh tính.');
    }
  }
}