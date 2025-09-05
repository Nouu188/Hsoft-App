import {
    Injectable,
    Inject,
    Logger,
    BadRequestException,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { Membership } from './entities/membership.entity';
import { MembershipHospital } from './entities/membership_hospitals.entity';
import { MembershipClinic } from './entities/membership_clinics.entity';
import { MembershipDoctor } from './entities/membership_doctors.entity';
import { MembershipAppointment } from './entities/membership_appointments.entity';
import { MembershipDose } from './entities/membership_doses.entity';
import { MembershipNotification } from './entities/membership_notifications.entity';
import { AssignHospitalDto } from './dtos/assign-hospital.dto';
import { MembershipProducer } from '../jobs/producers/membership.producer';
import { CreateMembershipDto } from './dtos/check-membership.dto';
import { MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { EnrichedMembership } from './dtos/enriched-membership.dto';

@Injectable()
export class MembershipService {
    private readonly logger = new Logger(MembershipService.name);
    private readonly CACHE_TTL = 60;

    constructor(
        @InjectRepository(Membership)
        private readonly membershipRepo: Repository<Membership>,

        @InjectRepository(MembershipHospital)
        private readonly membershipHospitalRepo: Repository<MembershipHospital>,

        @InjectRepository(MembershipClinic)
        private readonly membershipClinicRepo: Repository<MembershipClinic>,

        @InjectRepository(MembershipDoctor)
        private readonly membershipDoctorRepo: Repository<MembershipDoctor>,

        @InjectRepository(MembershipAppointment)
        private readonly membershipAppointmentRepo: Repository<MembershipAppointment>,

        @InjectRepository(MembershipDose)
        private readonly membershipDoseRepo: Repository<MembershipDose>,

        @InjectRepository(MembershipNotification)
        private readonly membershipNotificationRepo: Repository<MembershipNotification>,

        private readonly dataSource: DataSource,

        @InjectMetric(MetricName.MEMBERSSHIP_CHANGES_TOTAL)
        private readonly membershipCounter: Counter<string>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,

        private readonly membershipProducer: MembershipProducer,
    ) { }

    async create(dto: CreateMembershipDto): Promise<Membership> {
        this.logger.log(`Create membership requested: user=${dto.userId} identity=${dto.identityId} role=${dto.role}`);

        const exists = await this.membershipRepo.findOne({
            where: { userId: dto.userId, identityId: dto.identityId },
        });
        if (exists) {
            this.logger.warn('Membership already exists', { userId: dto.userId, identityId: dto.identityId });
            throw new ConflictException('membership already exists');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const newMembership = this.membershipRepo.create({
                userId: dto.userId,
                identityId: dto.identityId,
                role: dto.role ?? 'PATIENT',
                isActive: dto.isActive ?? true,
            });

            const saved = await queryRunner.manager.save(Membership, newMembership);

            await queryRunner.commitTransaction();

            try {
                this.membershipCounter.inc({ action: 'create', role: saved.role }, 1);
            } catch (err) {
                this.logger.error('Failed to inc membership_changes_total metric', err);
            }

            await this._publishWithRetry(async () => this.membershipProducer.emitCreated({
                membership: saved,
                ts: new Date().toISOString(),
            }), 'membership.created', saved.id);

            await this._invalidateUserCache(dto.userId);

            this.logger.log(`Membership created successfully id=${saved.id}`);
            return saved;
        } catch (err) {
            this.logger.error('Error creating membership', err);
            try {
                await queryRunner.rollbackTransaction();
            } catch (rbErr) {
                this.logger.error('Failed to rollback transaction for create membership', rbErr);
            }
            if (err instanceof ConflictException) throw err;
            throw new InternalServerErrorException('Failed to create membership');
        } finally {
            await queryRunner.release();
        }
    }

    async assignHospital(dto: AssignHospitalDto) {
        this.logger.log(`Assign hospital requested: membership=${dto.membershipId} hospital=${dto.hospitalId} role=${dto.hospitalRole}`);

        const membership = await this.membershipRepo.findOne({ where: { id: dto.membershipId } });
        if (!membership) {
            this.logger.warn('Membership not found for assignHospital', { membershipId: dto.membershipId });
            throw new NotFoundException('membership not found');
        }

        const existingMembershipHospital = await this.membershipHospitalRepo.findOne({
            where: { membershipId: dto.membershipId, hospitalId: dto.hospitalId },
        });
        if (existingMembershipHospital) {
            this.logger.warn('Hospital already assigned to membership', { membershipId: dto.membershipId, hospitalId: dto.hospitalId });
            throw new ConflictException('membership already assigned to this hospital');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const newMembershipHospital = this.membershipHospitalRepo.create({
                membershipId: dto.membershipId,
                hospitalId: dto.hospitalId,
                hospitalRole: dto.hospitalRole ?? undefined,
            });

            const saved = await queryRunner.manager.save(MembershipHospital, newMembershipHospital);

            await queryRunner.commitTransaction();

            try {
                this.membershipCounter.inc({ action: 'assign_hospital', role: dto.hospitalRole ?? 'unknown' }, 1);
            } catch (err) {
                this.logger.error('Failed to inc assign_hospital metric', err);
            }

            await this._publishWithRetry(async () => this.membershipProducer.emitAssignedHospital({
                membershipHospital: saved,
                ts: new Date().toISOString(),
            }), 'membership.assigned_hospital', saved.id);

            const existingMembership = await this.membershipRepo.findOne({ where: { id: dto.membershipId } });
            if (existingMembership) await this._invalidateUserCache(existingMembership.userId);
            await this._invalidateHospitalCache(dto.hospitalId);

            this.logger.log(`Assigned hospital saved id=${saved.id}`);
            return saved;
        } catch (err) {
            if (this._isPostgresUniqueViolation(err)) {
                this.logger.warn('Unique constraint violation when assigning hospital (likely concurrent request)', { membershipId: dto.membershipId, hospitalId: dto.hospitalId, err });

                try { await queryRunner.rollbackTransaction(); } catch (_) { }
                throw new ConflictException('membership already assigned to this hospital (concurrent)');
            }

            this.logger.error('Error assigning hospital to membership', err);
            try {
                await queryRunner.rollbackTransaction();
            } catch (rbErr) {
                this.logger.error('Failed rollback in assignHospital', rbErr);
            }
            throw new InternalServerErrorException('Failed to assign hospital to membership');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Find all memberships for a user (optionally include related assigned hospitals/clinics/doctors).
     */
    async findByUser(
        userId: string,
        includeRelations = true,
    ): Promise<EnrichedMembership[]> {
        this.logger.debug(`findByUser userId=${userId} includeRelations=${includeRelations}`);

        // 1. Lấy tất cả memberships của user
        const memberships = await this.membershipRepo.find({ where: { userId } });
        if (!includeRelations || memberships.length === 0) {
            return memberships as EnrichedMembership[];
        }

        const membershipIds = memberships.map(m => m.id);

        // 2. Chạy query song song để lấy tất cả relations
        const [hospitals, clinics, doctors] = await Promise.all([
            this.membershipHospitalRepo.find({ where: { membershipId: In(membershipIds) } }),
            this.membershipClinicRepo.find({ where: { membershipId: In(membershipIds) } }),
            this.membershipDoctorRepo.find({ where: { membershipId: In(membershipIds) } }),
        ]);

        // 3. Hàm groupByMembership chung
        const groupByMembership = <T extends { membershipId: string }>(items: T[]) =>
            items.reduce((acc: Record<string, T[]>, item) => {
                (acc[item.membershipId] ??= []).push(item);
                return acc;
            }, {});

        const hospitalByMembership = groupByMembership(hospitals);
        const clinicByMembership = groupByMembership(clinics);
        const doctorByMembership = groupByMembership(doctors);

        // 4. Map lại kết quả enriched
        const enriched: EnrichedMembership[] = memberships.map(m => ({
            ...m,
            assignedHospitals: hospitalByMembership[m.id] ?? [],
            assignedClinics: clinicByMembership[m.id] ?? [],
            assignedDoctors: doctorByMembership[m.id] ?? [],
        }));

        this.logger.debug(
            `findByUser result user=${userId} memberships=${memberships.length} hospitals=${hospitals.length} clinics=${clinics.length} doctors=${doctors.length}`,
        );

        return enriched;
    }

    async findMembersByHospital(
        hospitalId: string,
        page = 1,
        pageSize = 25,
    ): Promise<{
        total: number;
        page: number;
        pageSize: number;
        items: { membershipHospital: MembershipHospital; membership: Membership | null }[];
    }> {
        this.logger.debug(
            `Finding members by hospital: hospitalId=${hospitalId}, page=${page}, pageSize=${pageSize}`,
        );

        const offset = (page - 1) * pageSize;

        const [membershipHospitals, total] = await this.membershipHospitalRepo
            .createQueryBuilder('mh')
            .innerJoin('mh.membership', 'm')
            .where('mh.hospitalId = :hospitalId', { hospitalId })
            .orderBy('mh.createdAt', 'DESC')
            .skip(offset)
            .take(pageSize)
            .getManyAndCount();

        if (membershipHospitals.length === 0) {
            this.logger.debug(
                `No members found for hospitalId=${hospitalId} (page=${page}, pageSize=${pageSize})`,
            );
            return { total: 0, page, pageSize, items: [] };
        }

        const membershipIds = membershipHospitals.map(mh => mh.membershipId);
        const memberships = await this.membershipRepo.findBy({ id: In(membershipIds) });

        const membershipMap = memberships.reduce<Record<string, Membership>>((acc, m) => {
            acc[m.id] = m;
            return acc;
        }, {});

        const items = membershipHospitals.map(mh => ({
            membershipHospital: mh,
            membership: membershipMap[mh.membershipId] ?? null,
        }));

        this.logger.debug(
            `Found ${items.length}/${total} members for hospitalId=${hospitalId} (page=${page}, pageSize=${pageSize})`,
        );

        return {
            total,
            page,
            pageSize,
            items,
        };
    }

    async updateRole(dto: UpdateRoleDto) {
        this.logger.log(
            `Update role requested: membershipId=${dto.membershipId}, newRole=${dto.newRole}`,
        );

        const membership = await this.membershipRepo.findOne({
            where: { id: dto.membershipId },
        });

        if (!membership) {
            this.logger.warn(`Membership not found for updateRole: membershipId=${dto.membershipId}`,);
            throw new NotFoundException('membership not found');
        }

        const oldRole: string = membership.role ?? 'UNKNOWN';
        if (oldRole === dto.newRole) {
            this.logger.log(`Role update skipped: membershipId=${dto.membershipId}, already=${dto.newRole}`,);
            return membership;
        }

        membership.role = dto.newRole;

        try {
            const saved = await this.membershipRepo.save(membership);

            try {
                this.membershipCounter.inc(
                    { action: 'role_changed', role: dto.newRole },
                    1,
                );
            } catch (err) {
                this.logger.error(`Failed to increment role_changed metric: membershipId=${saved.id}`, err);
            }

            await this._publishWithRetry(
                async () =>
                    this.membershipProducer.emitRoleChanged(
                        saved.id,
                        oldRole,
                        dto.newRole,
                    ),
                'membership.role_changed',
                saved.id,
            );

            await this._invalidateUserCache(saved.userId);

            this.logger.log(
                `Membership role updated successfully: membershipId=${saved.id}, from=${oldRole}, to=${dto.newRole}`,
            );

            return saved;
        } catch (err) {
            this.logger.error(
                `Failed to update membership role: membershipId=${dto.membershipId}`,
                err,
            );
            throw new InternalServerErrorException('Failed to update role');
        }
    }

    async remove(membershipId: string) {
        this.logger.log(`Remove membership requested id=${membershipId}`);

        const mem = await this.membershipRepo.findOne({ where: { id: membershipId } });
        if (!mem) {
            this.logger.warn('Membership not found for remove', { membershipId });
            throw new NotFoundException('membership not found');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(MembershipHospital, { membershipId });
            await queryRunner.manager.delete(MembershipClinic, { membershipId });
            await queryRunner.manager.delete(MembershipDoctor, { membershipId });
            await queryRunner.manager.delete(MembershipAppointment, { membershipId });
            await queryRunner.manager.delete(MembershipDose, { membershipId });
            await queryRunner.manager.delete(MembershipNotification, { membershipId });
            await queryRunner.manager.delete(Membership, { id: membershipId });

            await queryRunner.commitTransaction();

            try {
                this.membershipCounter.inc({ action: 'remove', role: mem.role ?? 'unknown' }, 1);
            } catch (err) {
                this.logger.error('Failed to inc remove metric', err);
            }

            await this._publishWithRetry(async () => this.membershipProducer.emitRemoved(
                membershipId,
            ), 'membership.removed', membershipId);

            await this._invalidateUserCache(mem.userId);
            this.logger.log(`Removed membership id=${membershipId}`);
            return { success: true };
        } catch (err) {
            this.logger.error('Failed to remove membership', err);
            try {
                await queryRunner.rollbackTransaction();
            } catch (rbErr) {
                this.logger.error('Rollback failed in remove membership', rbErr);
            }
            throw new InternalServerErrorException('Failed to remove membership');
        } finally {
            await queryRunner.release();
        }
    }

    async checkMembership(
        userId: string,
        tenantId: string,
        role?: string,
    ): Promise<boolean> {
        const normalizedRole = role?.toUpperCase();
        const cacheKey = this._cacheKeyCheck(userId, tenantId, normalizedRole);

        try {
            const cached = await this.cacheManager.get<boolean>(cacheKey);
            if (typeof cached === 'boolean') {
                this.logger.debug(
                    `checkMembership cache HIT: userId=${userId}, tenantId=${tenantId}, role=${normalizedRole}, allowed=${cached}`,
                );
                return cached;
            }
        } catch (err) {
            this.logger.warn(
                `checkMembership cache GET failed: userId=${userId}, tenantId=${tenantId}`,
                err,
            );
        }

        const activeMemberships = await this.membershipRepo.find({
            where: { userId, isActive: true },
        });

        if (activeMemberships.length === 0) {
            this.logger.debug(
                `checkMembership MISS: no active memberships found for userId=${userId}`,
            );
            await this._cacheSetSafely(cacheKey, false, this.CACHE_TTL);
            return false;
        }

        if (
            normalizedRole &&
            activeMemberships.some(
                m => m.role?.toUpperCase() === normalizedRole,
            )
        ) {
            this.logger.debug(
                `checkMembership DIRECT role match: userId=${userId}, role=${normalizedRole}`,
            );
            await this._cacheSetSafely(cacheKey, true, this.CACHE_TTL);
            return true;
        }

        const membershipIds = activeMemberships.map(m => m.id);
        const hospitalAssignment = await this.membershipHospitalRepo.findOne({
            where: { membershipId: In(membershipIds), hospitalId: tenantId },
        });

        const allowed =
            !!hospitalAssignment &&
            (!normalizedRole ||
                (hospitalAssignment.hospitalRole?.toUpperCase() === normalizedRole));

        this.logger.debug(
            `checkMembership assignment check: userId=${userId}, tenantId=${tenantId}, role=${normalizedRole}, allowed=${allowed}`,
        );

        await this._cacheSetSafely(cacheKey, allowed, this.CACHE_TTL);
        return allowed;
    }

    async bulkAssignHospitals(
        items: { membershipId: string; hospitalId: string; hospitalRole?: string }[],
    ) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new BadRequestException('bulkAssignHospitals: items array is empty');
        }

        this.logger.log(`bulkAssignHospitals started, count=${items.length}`);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const newMappings: MembershipHospital[] = [];

            for (const item of items) {
                const { membershipId, hospitalId, hospitalRole } = item;

                const existing = await queryRunner.manager.findOne(MembershipHospital, {
                    where: { membershipId, hospitalId },
                });

                if (existing) {
                    this.logger.warn(
                        `bulkAssignHospitals: duplicate skipped (membershipId=${membershipId}, hospitalId=${hospitalId})`,
                    );
                    continue;
                }

                const mapping = queryRunner.manager.create(MembershipHospital, {
                    membershipId,
                    hospitalId,
                    ...(hospitalRole ? { hospitalRole } : {}), // tránh null lỗi
                });

                const savedMapping = await queryRunner.manager.save(
                    MembershipHospital,
                    mapping,
                );
                newMappings.push(savedMapping);

                try {
                    this.membershipCounter.inc(
                        {
                            action: 'assign_hospital_bulk',
                            role: hospitalRole ?? 'unknown',
                        },
                        1,
                    );
                } catch (err) {
                    this.logger.error(
                        `bulkAssignHospitals: failed to increment metric (membershipId=${membershipId}, hospitalId=${hospitalId})`,
                        err,
                    );
                }
            }

            await queryRunner.commitTransaction();

            if (newMappings.length > 0) {
                await this._publishWithRetry(
                    async () => this.membershipProducer.emitBulkAssignedHospital(newMappings),
                    'membership.bulk_assigned_hospital',
                    'bulk-' + Date.now(),
                );
            }

            if (newMappings.length > 0) {
                const affectedMembershipIds = newMappings.map((m) => m.membershipId);
                const memberships = await this.membershipRepo.findBy({
                    id: In(affectedMembershipIds),
                });

                const affectedUserIds = [
                    ...new Set(memberships.map((m) => m.userId)),
                ];
                await Promise.all(
                    affectedUserIds.map((u) => this._invalidateUserCache(u)),
                );

                const affectedHospitalIds = [
                    ...new Set(newMappings.map((m) => m.hospitalId)),
                ];
                await Promise.all(
                    affectedHospitalIds.map((h) => this._invalidateHospitalCache(h)),
                );
            }

            this.logger.log(
                `bulkAssignHospitals completed, created=${newMappings.length}, skipped=${items.length - newMappings.length
                }`,
            );

            return newMappings;
        } catch (err) {
            this.logger.error('bulkAssignHospitals failed, rolling back...', err);
            try {
                await queryRunner.rollbackTransaction();
            } catch (rbErr) {
                this.logger.error('bulkAssignHospitals rollback error', rbErr);
            }
            throw new InternalServerErrorException('bulkAssignHospitals failed');
        } finally {
            await queryRunner.release();
        }
    }

    // -------------------------
    // Helpers
    // -------------------------
    private _cacheKeyCheck(userId: string, tenantId: string, role?: string) {
        return `membership:check:${userId}:${tenantId}:${role ?? 'ANY'}`;
    }

    private async _invalidateUserCache(userId: string): Promise<void> {
        // Chúng ta biết cache-manager mặc định không hỗ trợ xóa theo pattern (DEL với wildcard).
        // Do đó, ở đây chỉ xóa những key có format chuẩn mà ta đang sử dụng cho user.
        // Nếu cần nâng cao, nên dùng Redis client gốc để xóa theo pattern.

        const summaryCacheKey = `membership:user:${userId}:summary`;

        try {
            await this.cacheManager.del(summaryCacheKey);
            this.logger.debug(`User cache invalidated successfully: userId=${userId}, key=${summaryCacheKey}`);
        } catch (err) {
            this.logger.warn(
                `Failed to invalidate cache for userId=${userId}, key=${summaryCacheKey}`,
                err,
            );
        }

        // 👉 TODO: Nếu có thêm các key khác liên quan (vd: membership:check:${userId}:<tenantId>)
        // thì ta có thể xóa ở đây. Một cách khác là duy trì danh sách các tenantId đã cache theo user
        // để loop qua xóa.
    }

    private async _invalidateHospitalCache(hospitalId: string) {
        try {
            await this.cacheManager.del(`membership:hospital:${hospitalId}:members`).catch(() => { });
        } catch (err) {
            this.logger.warn('Failed to invalidate hospital cache', err);
        }
    }

    private async _cacheSetSafely(
        key: string,
        value: boolean,
        ttlSeconds: number,
    ) {
        try {
            await this.cacheManager.set(key, value, ttlSeconds);
            this.logger.debug(
                `Cache set successfully: key=${key}, ttl=${ttlSeconds}s, value=${value}`,
            );
        } catch (err) {
            this.logger.warn(
                `Cache set failed: key=${key}, ttl=${ttlSeconds}s`,
                err,
            );
        }
    }

    private async _publishWithRetry(publisherFn: () => Promise<void>, topic: string, idForLogs: string | number) {
        const maxAttempts = 3;
        let attempt = 0;
        let lastErr: any = null;
        const baseDelayMs = 300;

        while (attempt < maxAttempts) {
            attempt += 1;
            try {
                this.logger.debug(`Publishing event topic=${topic} id=${idForLogs} attempt=${attempt}`);
                await publisherFn();
                this.logger.log(`Published event topic=${topic} id=${idForLogs} attempt=${attempt}`);
                return;
            } catch (err) {
                lastErr = err;
                this.logger.error(`Publish attempt ${attempt} failed topic=${topic} id=${idForLogs}`, err?.stack ?? err);

                const delay = baseDelayMs * Math.pow(2, attempt - 1);

                await new Promise(res => setTimeout(res, delay));
            }
        }

        this.logger.error(`All publish attempts failed for topic=${topic} id=${idForLogs}`, lastErr);
        // Do not throw to avoid failing main business operation; but you may want to alert/record to DB/monitoring
    }

    private _isPostgresUniqueViolation(err: any): boolean {
        // TypeORM + PG: err.code === '23505'
        return err && (err.code === '23505' || (err.detail && /already exists/.test(err.detail)));
    }
}
