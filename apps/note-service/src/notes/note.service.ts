import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteInput } from './dtos/create-note.input';
import { UpdateNoteInput } from './dtos/update-note.input';

@Injectable()
export class NotesService {
    private readonly logger = new Logger(NotesService.name);

    constructor(
        @InjectRepository(Note)
        private readonly notesRepository: Repository<Note>,
        private readonly dataSource: DataSource,
    ) { }

    private isAffected(result: DeleteResult | { affected?: number | null }): boolean {
        return (result.affected ?? 0) > 0;
    }

    async create(createNoteInput: CreateNoteInput, userId: string): Promise<Note> {
        return this.dataSource.transaction(async (manager) => {
            try {
                const newNote = manager.create(Note, { ...createNoteInput, userId });
                const saved = await manager.save(Note, newNote);

                this.logger.debug(`Created new note [id=${saved.id}] for user [${userId}]`);
                return saved;
            } catch (error) {
                this.logger.error(`Failed to create note for user [${userId}]`, error.stack);
                throw new InternalServerErrorException('Could not create note');
            }
        });
    }

    async findAll(userId: string): Promise<Note[]> {
        return this.notesRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, userId: string): Promise<Note> {
        const note = await this.notesRepository.findOne({ where: { id, userId } });

        if (!note) {
            this.logger.warn(`Note [id=${id}] not found or not owned by user [${userId}]`);
            throw new NotFoundException(`Note with ID "${id}" not found`);
        }

        return note;
    }

    async update(updateNoteInput: UpdateNoteInput, userId: string): Promise<Note> {
        return this.dataSource.transaction(async (manager) => {
            const { id, ...updateData } = updateNoteInput;
            const note = await this.findOne(id, userId);

            Object.assign(note, updateData);

            try {
                const updated = await manager.save(Note, note);
                this.logger.debug(`Updated note [id=${id}] for user [${userId}]`);
                return updated;
            } catch (error) {
                this.logger.error(`Failed to update note [id=${id}] for user [${userId}]`, error.stack);
                throw new InternalServerErrorException('Could not update note');
            }
        });
    }

    async remove(id: string, userId: string): Promise<boolean> {
        return this.dataSource.transaction(async (manager) => {
            const note = await this.findOne(id, userId);

            try {
                const result = await manager.softDelete(Note, { id: note.id });
                if (this.isAffected(result)) {
                    this.logger.debug(`Soft deleted note [id=${id}] for user [${userId}]`);
                    return true;
                }

                this.logger.warn(`Soft delete failed for note [id=${id}] user [${userId}]`);
                return false;
            } catch (error) {
                this.logger.error(`Failed to remove note [id=${id}] for user [${userId}]`, error.stack);
                throw new InternalServerErrorException('Could not remove note');
            }
        });
    }

    async restore(id: string, userId: string): Promise<boolean> {
        return this.dataSource.transaction(async (manager) => {
            const note = await manager.findOne(Note, { where: { id, userId }, withDeleted: true });

            if (!note) throw new NotFoundException(`Note with ID "${id}" not found`);
            if (!note.deletedAt) throw new ForbiddenException(`Note with ID "${id}" is not deleted`);

            const result = await manager.restore(Note, note.id);
            return this.isAffected(result);
        });
    }
}
