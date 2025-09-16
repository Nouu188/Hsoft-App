import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalService } from 'apps/tenant-management-service/src/domain';
import { IMedicalServiceRepository } from 'apps/tenant-management-service/src/domain/interfaces/medical-service';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class MedicalServiceRepository implements IMedicalServiceRepository {
    private readonly logger = new Logger(MedicalServiceRepository.name);

    constructor(
        @InjectRepository(MedicalService, 'tenantConnection')
        private readonly ormRepo: Repository<MedicalService>,
    ) { }

    private getRepo(manager?: EntityManager): Repository<MedicalService> {
        return manager ? manager.getRepository(MedicalService) : this.ormRepo;
    }

    findById(id: string): Promise<MedicalService | null> {
        return this.ormRepo.findOneBy({ id });
    }

    findManyByIds(ids: string[]): Promise<MedicalService[]> {
        return this.ormRepo.find({ where: { id: In(ids) } });
    }

    save(hospital: MedicalService | DeepPartial<MedicalService>, manager?: EntityManager): Promise<MedicalService>;
    save(hospital: MedicalService[] | DeepPartial<MedicalService>[], manager?: EntityManager): Promise<MedicalService[]>;

    async save(
        MedicalServiceOrIdentities: MedicalService | MedicalService[] | DeepPartial<MedicalService> | DeepPartial<MedicalService>[],
        manager?: EntityManager
    ): Promise<MedicalService | MedicalService[]> {
        const repo = this.getRepo(manager);
        if (Array.isArray(MedicalServiceOrIdentities)) {
            return repo.save(MedicalServiceOrIdentities);
        }

        return repo.save(MedicalServiceOrIdentities);
    }

    findAll(): Promise<MedicalService[]> {
        return this.ormRepo.find();
    }

    findMany(ids: string[]): Promise<MedicalService[]> {
        return this.ormRepo.find({
            where: { id: In(ids) }
        });
    }

    async upsert(services: Partial<MedicalService>[]): Promise<MedicalService[]> {
        if (services.length === 0) return [];

        this.logger.debug(`Upserting ${services.length} medical services.`);
        
        const result = await this.ormRepo.upsert(services, ['id']);

        // Upsert không trả về entity đầy đủ, chúng ta cần query lại
        const ids = services.map(s => s.id!);
        return this.ormRepo.findByIds(ids);
    }
}