import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Identity } from "apps/tenant-management-service/src/domain/identities/entities";
import { IIdentityRepository } from "apps/tenant-management-service/src/domain/identities/interfaces";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";

export class IdentityRepository implements IIdentityRepository {
    private readonly logger = new Logger(IdentityRepository.name);

    constructor(
        @InjectRepository(Identity, "tenantConnection")
        private readonly ormRepo: Repository<Identity>,
    ) { }

    private getRepo(manager?: EntityManager): Repository<Identity> {
        return manager ? manager.getRepository(Identity) : this.ormRepo;
    }

    async findById(id: string): Promise<Identity | null> {
        return this.ormRepo.findOne({ where: { id } });
    }

    async findAll(): Promise<Identity[]> {
        return this.ormRepo.find();
    }

    async findMany(ids: string[]): Promise<Identity[]> {
        return this.ormRepo.find({ where: { id: In(ids) } });
    }

    async findByUserId(userId: string): Promise<Identity | null> {
        return this.ormRepo.findOne({ where: { userId } });
    }

    save(hospital: Identity | DeepPartial<Identity>, manager?: EntityManager): Promise<Identity>;
    save(hospital: Identity[] | DeepPartial<Identity>[], manager?: EntityManager): Promise<Identity[]>;

    async save(
        identityOrIdentities: Identity | Identity[] | DeepPartial<Identity> | DeepPartial<Identity>[],
        manager?: EntityManager
    ): Promise<Identity | Identity[]> {
        const repo = this.getRepo(manager);
        if (Array.isArray(identityOrIdentities)) {
            return repo.save(identityOrIdentities);
        }

        return repo.save(identityOrIdentities);
    }

    async create(identity: DeepPartial<Identity>): Promise<Identity> {
        return this.ormRepo.create(identity);
    }
}