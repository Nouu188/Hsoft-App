import { BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Dose, DoseStatus, IDoseRepository } from "apps/scheduling-service/src/domain";
import {
    Between,
    DeepPartial,
    EntityManager,
    In,
    Repository,
} from "typeorm";

export class DoseRepository implements IDoseRepository {
    private readonly logger = new Logger(DoseRepository.name);

    constructor(
        @InjectRepository(Dose, 'schedulingConnection') private readonly ormRepo: Repository<Dose>,
    ) { }

    async findById(id: string, manager?: EntityManager): Promise<Dose | null> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.findOne({ where: { id } });
    }

    async findAll(manager?: EntityManager): Promise<Dose[]> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.find();
    }

    async findMany(ids: string[], manager?: EntityManager): Promise<Dose[]> {
        if (!ids || ids.length === 0) return [];
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.find({ where: { id: In(ids) } });
    }

    save(dose: Dose | DeepPartial<Dose>, manager?: EntityManager): Promise<Dose>;
    save(doses: (Dose | DeepPartial<Dose>)[], manager?: EntityManager): Promise<Dose[]>;

    async save(
        doseOrDoses: Dose | Dose[] | DeepPartial<Dose> | DeepPartial<Dose>[],
        manager?: EntityManager
    ): Promise<Dose | Dose[]> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;

        if (Array.isArray(doseOrDoses)) {
            return repo.save(doseOrDoses);
        }
        return repo.save(doseOrDoses);
    }

    async findByIdAndUserId(
        id: string,
        userId: string,
        manager?: EntityManager,
    ): Promise<Dose | null> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.findOne({ where: { id, userId } });
    }

    async findByDateRangeAndUserId(
        startDate: Date,
        endDate: Date,
        userId: string,
        manager?: EntityManager,
    ): Promise<Dose[]> {
        if (!userId || !startDate || !endDate) {
            throw new BadRequestException(
                "userId, startDate, and endDate are required.",
            );
        }

        if (startDate > endDate) {
            throw new BadRequestException("startDate cannot be after endDate.");
        }

        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.find({
            where: { userId, due_at: Between(startDate, endDate) },
            order: { due_at: "ASC" },
        });
    }

    async findByUserIdAndStatus(
        userId: string,
        status: DoseStatus,
        manager?: EntityManager,
    ): Promise<Dose[]> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.find({ where: { userId, status } });
    }

    async findByIdsAndUser(
        ids: string[],
        userId: string,
        manager?: EntityManager,
    ): Promise<Dose[]> {
        if (!ids || ids.length === 0) return [];
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.find({ where: { id: In(ids), userId } });
    }

    async upsertFromHospital(
        dose: Dose | DeepPartial<Dose>,
        manager?: EntityManager,
    ): Promise<Dose> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        return repo.save(dose);
    }

    async updateStatusByCondition(
        condition: { status: DoseStatus; dueAtBefore: Date },
        newStatus: DoseStatus,
        manager?: any
    ): Promise<number> {
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        const result = await repo
            .createQueryBuilder()
            .update(Dose)
            .set({ status: newStatus })
            .where("status = :status", { status: condition.status })
            .andWhere("due_at < :dueAt", { dueAt: condition.dueAtBefore })
            .execute();

        const affected = result.affected ?? 0;
        if (affected > 0) {
            this.logger.log(`Updated ${affected} doses from ${condition.status} -> ${newStatus}`);
        }
        return affected;
    }

    async deleteByIds(ids: string[], manager?: EntityManager): Promise<void> {
        if (!ids || ids.length === 0) return;
        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        await repo.delete({ id: In(ids) });
    }

    async deleteByUserId(userId: string, manager?: EntityManager): Promise<number> {
        if (!userId) {
            return 0;
        }

        const repo = manager ? manager.getRepository(Dose) : this.ormRepo;
        const result = await repo.delete({ userId });

        return result.affected ?? 0;
    }
}
