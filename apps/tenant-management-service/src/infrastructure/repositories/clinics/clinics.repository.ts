import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clinic, IClinicRepository } from "apps/tenant-management-service/src/domain";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";

@Injectable()
export class ClinicRepository implements IClinicRepository {
    private readonly logger = new Logger(ClinicRepository.name);

    constructor(
        @InjectRepository(Clinic, 'tenantConnection') private readonly ormRepo: Repository<Clinic>
    ) { }

    findById(id: string): Promise<Clinic | null> {
        return this.ormRepo.findOneBy({ id });
    }

    findAll(): Promise<Clinic[]> {
        return this.ormRepo.find();
    }

    findMany(ids: string[]): Promise<Clinic[]> {
        return this.ormRepo.find({ where: { id: In(ids) } });
    }

    save(clinic: Clinic | DeepPartial<Clinic>, manager?: EntityManager): Promise<Clinic>;
    save(clinics: (Clinic | DeepPartial<Clinic>)[], manager?: EntityManager): Promise<Clinic[]>;

    async save(
        clinicOrClinics: Clinic | Clinic[] | DeepPartial<Clinic> | DeepPartial<Clinic>[],
        manager?: EntityManager
    ): Promise<Clinic | Clinic[]> {
        const repo = manager ? manager.getRepository(Clinic) : this.ormRepo;

        if (Array.isArray(clinicOrClinics)) {
            return repo.save(clinicOrClinics);
        }
        return repo.save(clinicOrClinics);
    }

    findAllActive(): Promise<Clinic[]> {
        return this.ormRepo.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }

    async upsert(clinics: Partial<Clinic>[]): Promise<Clinic[]> {
        if (clinics.length === 0) {
            this.logger.debug('Upsert called with an empty array of clinics. Skipping.');
            return [];
        }

        this.logger.log(`Upserting ${clinics.length} clinics.`);
        // `upsert` sẽ INSERT hoặc UPDATE dựa trên conflict target.
        // Ở đây, một phòng khám được xác định duy nhất bởi `hospitalId` và `externalCode`.
        const result = await this.ormRepo.upsert(clinics, ['hospitalId', 'externalCode']);

        // Upsert không trả về entity đầy đủ, chúng ta cần query lại để có ID nội bộ
        const externalCodes = clinics.map(c => c.externalCode!);
        const hospitalId = clinics[0].hospitalId; // Giả sử tất cả clinics thuộc cùng một bệnh viện
        return this.ormRepo.find({ where: { hospitalId, externalCode: In(externalCodes) } });
    }
}