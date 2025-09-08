import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { HospitalsService } from '../../hospitals/hospitals.service';
import { CreateIdentityInput } from '../dtos/create-identity-input.dto';
import { Identity } from '../entities/identity.entity';
import { Hospital } from '../../hospitals/entities/hospital.entity';

@Injectable()
export class IdentitiesService {
  private readonly logger = new Logger(IdentitiesService.name);

  constructor(
    @InjectRepository(Identity, 'tenantConnection') private readonly identityRepository: Repository<Identity>,
    @InjectDataSource('tenantConnection') private readonly dataSource: DataSource,
    private readonly hospitalService: HospitalsService,
    private readonly hospitalApiClient: HospitalApiClientService,
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

  async fetchIdentityFromHospital(
    phoneNumber: string,
    externalHospitalCode: string,
  ): Promise<Identity | null> {
    this.logger.debug(
      `[fetchIdentityFromHospital] Bắt đầu fetch cho phone=${phoneNumber}, externalCode=${externalHospitalCode}`,
    );

    try {
      const hospital = await this.hospitalService.getHospitalByCode(externalHospitalCode);
      if (!hospital) {
        this.logger.error(
          `[fetchIdentityFromHospital] Không tìm thấy plainExternalCode cho externalCode=${externalHospitalCode}`,
        );
        throw new NotFoundException(`Hospital code not found: ${externalHospitalCode}`);
      }

      const hospitalUrl = await this.hospitalService.getHospitalUrlByCode(hospital.plainExternalCode);
      if (!hospitalUrl) {
        this.logger.warn(
          `[Resolver] Không tìm thấy hospitalUrl cho externalCode=${externalHospitalCode}`,
        );
        throw new NotFoundException(
          `Hospital not found with code ${externalHospitalCode}`,
        );
      }

      const patient = await this.hospitalApiClient.fetchIdentityFromHospital(
        phoneNumber,
        hospitalUrl,
        hospital.plainExternalCode,
      );

      if (!patient) {
        this.logger.warn(
          `[fetchIdentityFromHospital] Không tìm thấy bệnh nhân tại bệnh viện externalCode=${externalHospitalCode}, phone=${phoneNumber}`,
        );
        return null;
      }

      this.logger.debug(
        `[fetchIdentityFromHospital] Tìm thấy bệnh nhân externalPatientCode=${patient.externalPatientCode}, hoten=${patient.fullName}`,
      );

      const identity = this.identityRepository.create({
        id: uuidv4(),
        phoneNumber: patient.phoneNumber,
        externalPatientCode: patient.externalPatientCode,
        fullName: patient.fullName,
        address: patient.address,
        gender: patient.gender,
        avatarUrl: patient.avatarUrl,
        healthInsuranceNumber: patient.healthInsuranceNumber,
        nationalId: patient.nationalId,
        birthYear: Number(patient.birthYear),
        hospitals: [],
      });

      return identity;
    } catch (error) {
      this.logger.error(
        `[fetchIdentityFromHospital] Lỗi khi fetch thông tin từ bệnh viện externalCode=${externalHospitalCode}, phone=${phoneNumber}`,
        error.stack || error,
      );
      throw new InternalServerErrorException(
        `Không thể lấy thông tin bệnh nhân từ bệnh viện`,
      );
    }
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const identityRepo = queryRunner.manager.getRepository(Identity);

      let identity = await identityRepo.findOne({
        where: { userId },
        relations: ['hospitals'],
      });

      if (externalHospitalCode) {
        const hospital = await this.hospitalService.getHospitalByCode(
          externalHospitalCode,
        );
        if (hospital) {
          const exists = cleanPayload.hospitals.some((h) => h.id === hospital.id);
          if (!exists) {
            cleanPayload.hospitals.push(hospital);
          }
        }
      }

      if (identity) {
        Object.assign(identity, cleanPayload);
        this.logger.debug(
          `[IdentitiesService] Updating existing Identity id=${identity.id}`,
        );
      } else {
        identity = identityRepo.create({
          ...cleanPayload,
          userId,
        });
        this.logger.debug(
          `[IdentitiesService] Creating new Identity for userId=${userId}`,
        );
      }

      const saved = await identityRepo.save(identity);

      await queryRunner.commitTransaction();

      this.logger.log(
        `[IdentitiesService] Successfully saved Identity id=${saved.id} for userId=${userId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `[IdentitiesService] Failed to save Identity for userId=${userId}. Error: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to save Identity');
    } finally {
      await queryRunner.release();
    }
  }
}
