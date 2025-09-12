import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Doctor, IDoctorRepository } from "apps/tenant-management-service/src/domain";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";

@Injectable()
export class DoctorRepository implements IDoctorRepository {
    private readonly logger = new Logger(DoctorRepository.name);

    constructor(
        @InjectRepository(Doctor, 'tenantConnection') private readonly ormRepo: Repository<Doctor>
    ) { }

    findById(id: string): Promise<Doctor | null> {
        return this.ormRepo.findOneBy({ id });
    }

    findAll(): Promise<Doctor[]> {
        return this.ormRepo.find();
    }

    findMany(ids: string[]): Promise<Doctor[]> {
        return this.ormRepo.find({ where: {id: In(ids)} });
    }

    save(doctor: Doctor | DeepPartial<Doctor>, manager?: EntityManager): Promise<Doctor>;
    save(doctors: (Doctor | DeepPartial<Doctor>)[], manager?: EntityManager): Promise<Doctor[]>;

    async save(
        doctorOrDoctors: Doctor | Doctor[] | DeepPartial<Doctor> | DeepPartial<Doctor>[],
        manager?: EntityManager
    ): Promise<Doctor | Doctor[]> {
        const repo = manager ? manager.getRepository(Doctor) : this.ormRepo;

        if (Array.isArray(doctorOrDoctors)) {
            return repo.save(doctorOrDoctors);
        }
        return repo.save(doctorOrDoctors);
    }
}