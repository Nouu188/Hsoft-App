import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { RefreshToken } from '../../../domain/users/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../../domain/users/interfaces/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken, 'accountConnection')
    private readonly ormRepository: Repository<RefreshToken>,
  ) {}

  // ------- READ ONLY methods -------
  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.ormRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.ormRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  // ------- WRITE methods -------
  
  async save(
    refreshToken: RefreshToken,
    manager?: EntityManager,
  ): Promise<RefreshToken> {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    return repo.save(refreshToken);
  }

  create(
    data: Partial<RefreshToken>,
    manager?: EntityManager,
  ): RefreshToken {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    return repo.create(data);
  }

  async update(
    criteria: Partial<RefreshToken>,
    data: Partial<RefreshToken>,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    await repo.update(criteria, data);
  }

  async revokeByToken(token: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    await repo.update({ token }, { revoked: true });
  }

  async revokeByUser(userId: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    await repo.update({ user: { id: userId } }, { revoked: true });
  }

  async deleteByToken(token: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    await repo.delete({ token });
  }

  async deleteByUser(userId: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(RefreshToken) : this.ormRepository;
    await repo.delete({ user: { id: userId } });
  }
}