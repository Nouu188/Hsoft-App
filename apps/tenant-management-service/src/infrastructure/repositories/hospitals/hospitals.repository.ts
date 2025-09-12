import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateHospitalInput, Hospital, IHospitalRepository, UpdateHospitalInput } from "apps/tenant-management-service/src/domain";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";

@Injectable()
export class HospitalRepository implements IHospitalRepository {
    private readonly logger = new Logger(HospitalRepository.name);

    constructor(
        @InjectRepository(Hospital, "tenantConnection")
        private readonly ormRepo: Repository<Hospital>,
    ) { }

    private getRepo(manager?: EntityManager): Repository<Hospital> {
        return manager ? manager.getRepository(Hospital) : this.ormRepo;
    }

    async findById(id: string): Promise<Hospital | null> {
        return this.ormRepo.findOne({ where: { id } });
    }

    async findAll(): Promise<Hospital[]> {
        return this.ormRepo.find();
    }

    async findMany(ids: string[]): Promise<Hospital[]> {
        return this.ormRepo.find({ where: { id: In(ids) } });
    }

    async findByExternalCode(externalCode: string): Promise<Hospital | null> {
        return this.ormRepo.findOne({ where: { externalCode } });
    }

    save(hospital: Hospital | DeepPartial<Hospital>, manager?: EntityManager): Promise<Hospital>;
    save(hospital: Hospital[] | DeepPartial<Hospital>[], manager?: EntityManager): Promise<Hospital[]>;

    async save(
        hospitalOrHospitals: Hospital | Hospital[] | DeepPartial<Hospital> | DeepPartial<Hospital>[],
        manager?: EntityManager
    ): Promise<Hospital | Hospital[]> {
        const repo = manager ? manager.getRepository(Hospital) : this.ormRepo;
        if (Array.isArray(hospitalOrHospitals)) {
            return repo.save(hospitalOrHospitals);
        }

        return repo.save(hospitalOrHospitals);
    }


    async createOne(input: CreateHospitalInput, manager?: EntityManager): Promise<Hospital> {
        const repo = this.getRepo(manager);
        const hospital = repo.create(input);
        try {
            const saved = await repo.save(hospital);
            this.logger.log(`[createOne] Created hospital id=${saved.id}`);
            return saved;
        } catch (error) {
            this.logger.error(`[createOne] Failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updateOne(input: UpdateHospitalInput, manager?: EntityManager): Promise<Hospital> {
        const repo = this.getRepo(manager);
        try {
            const updated = await repo.save(input);
            this.logger.log(`[updateOne] Updated hospital id=${updated.id}`);
            return updated;
        } catch (error) {
            this.logger.error(`[updateOne] Failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async removeOne(id: string, manager?: EntityManager): Promise<Boolean> {
        const repo = this.getRepo(manager);
        try {
            const result = await repo.delete(id);
            const success = !!result.affected && result.affected > 0;
            if (success) {
                this.logger.log(`[removeOne] Deleted hospital id=${id}`);
            } else {
                this.logger.warn(`[removeOne] Hospital not found id=${id}`);
            }
            return success;
        } catch (error) {
            this.logger.error(`[removeOne] Failed: ${error.message}`, error.stack);
            throw error;
        }
    }
}
