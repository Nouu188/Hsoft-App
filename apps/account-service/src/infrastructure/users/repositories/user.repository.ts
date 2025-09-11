import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RegisterByEmailInput } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/registration/register-by-email.input';
import { IUserRepository } from 'apps/account-service/src/domain/users/interfaces';
import { DeviceToken, User } from 'apps/account-service/src/domain/users/entities';
import { RegisterByHospitalInput } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/registration/register-by-hospital.input';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User, 'accountConnection')
    private readonly ormRepository: Repository<User>,
  ) { }
  
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.ormRepository.findOneBy({ phoneNumber });
  }

  async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOneBy({ id });
  }

  async findAll(): Promise<User[]> {
    return this.ormRepository.find();
  }

  async save(user: User, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.ormRepository;
    return repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOneBy({ email });
  }

  async createByEmail(
    registerInput: RegisterByEmailInput,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.ormRepository;

    const user = repo.create({
      email: registerInput.email,
      password: registerInput.password,
    });

    return repo.save(user);
  }

  async createByGoogle(
    registerInput: Partial<User>,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.ormRepository;
    const user = repo.create(registerInput);
    return repo.save(user);
  }

  async createByHospital(
    registerInput: RegisterByHospitalInput,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.ormRepository;

    const user = repo.create({
      phoneNumber: registerInput.phoneNumber,
      password: registerInput.password,
    });
    return repo.save(user);
  }

  async updatePasswordByUserId(
    userId: string,
    newPassword: string,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.ormRepository;

    const user = await repo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with userId ${userId} not found.`);
    }

    user.password = newPassword;
    return repo.save(user);
  }

  async updateDeviceTokenByUserId(
    userId: string,
    deviceToken: DeviceToken,
    manager?: EntityManager,
  ): Promise<Boolean> {
    const repo = manager ? manager.getRepository(User) : this.ormRepository;
    const user = await repo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with userId ${userId} not found.`);
    }
    const tokens = user.deviceTokens || [];
    if (!tokens.some((t) => t.token === deviceToken.token)) {
      tokens.push(deviceToken);
      await repo.save({ ...user, deviceTokens: tokens });
      this.logger.log(`Added ${deviceToken.type} device token for user ${userId}`);
    }

    return true;
  }
}