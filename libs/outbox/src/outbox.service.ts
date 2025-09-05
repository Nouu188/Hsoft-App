import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { OutboxEntity, OutboxStatus } from './entities/outbox.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OutboxService {
    private readonly logger = new Logger(OutboxService.name);

    constructor(
        private readonly outboxRepository: Repository<OutboxEntity>,
    ) { }

    async createOutboxMessage(
        payload: {
            aggregateType: string;
            aggregateId: string;
            eventType: string;
            payload: Record<string, any>;
            exchange: string;
            routingKey: string;
        },
        manager?: EntityManager,
    ): Promise<void> {
        const repo = manager ? manager.getRepository(OutboxEntity) : this.outboxRepository;
        const message = repo.create({
            ...payload,
            status: OutboxStatus.PENDING,
        });
        await repo.save(message);
        this.logger.debug(`Outbox message created: ${payload.eventType} for ${payload.aggregateType} ${payload.aggregateId}`);
    }
}
