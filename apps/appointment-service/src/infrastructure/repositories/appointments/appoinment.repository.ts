import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment, IAppointmentRepository } from "apps/appointment-service/src/domain";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";

export class AppointmentRepository implements IAppointmentRepository {
    private readonly logger = new Logger(AppointmentRepository.name);

    constructor(
        @InjectRepository(Appointment, 'appointmentConnection') private readonly ormRepo: Repository<Appointment>
    ) { }

    async findById(id: string, manager?: EntityManager): Promise<Appointment | null> {
        const repo = manager ? manager.getRepository(Appointment) : this.ormRepo;
        return repo.findOne({ where: { id } });
    }

    async findAll(manager?: EntityManager): Promise<Appointment[]> {
        const repo = manager ? manager.getRepository(Appointment) : this.ormRepo;
        return repo.find();
    }

    async findMany(ids: string[], manager?: EntityManager): Promise<Appointment[]> {
        if (!ids || ids.length === 0) return [];
        const repo = manager ? manager.getRepository(Appointment) : this.ormRepo;
        return repo.find({ where: { id: In(ids) } });
    }

    save(Appointment: Appointment | DeepPartial<Appointment>, manager?: EntityManager): Promise<Appointment>;
    save(Appointments: (Appointment | DeepPartial<Appointment>)[], manager?: EntityManager): Promise<Appointment[]>;

    async save(
        appointmentOrAppointments: Appointment | Appointment[] | DeepPartial<Appointment> | DeepPartial<Appointment>[],
        manager?: EntityManager
    ): Promise<Appointment | Appointment[]> {
        const repo = manager ? manager.getRepository(Appointment) : this.ormRepo;

        if (Array.isArray(appointmentOrAppointments)) {
            return repo.save(appointmentOrAppointments);
        }
        return repo.save(appointmentOrAppointments);
    }

    async findByUserId(userId: string, manager?: EntityManager): Promise<Appointment[]> {
        const repo = manager ? manager.getRepository(Appointment) : this.ormRepo;
        return await repo.find({
            where: { userId },
            order: { appointmentTime: 'DESC' },
            relations: ['clinic', 'doctor'],
        });
    }
} 