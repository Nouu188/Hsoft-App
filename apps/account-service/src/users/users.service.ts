import { Role } from '@app/auth/enums/role.enum';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { IdentityPayload } from 'apps/tenant-management-service/src/identities/dtos/identity.payload';
import * as crypto from 'node:crypto';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user-input.dto';
import { UserPayload } from './dto/user.payload';
import { User } from './entities/user.entity';
import { CreateIdentityInput } from 'apps/tenant-management-service/src/identities/dtos/create-identity-input.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User, 'accountConnection') private readonly usersRepository: Repository<User>,
    @InjectDataSource('accountConnection') private readonly dataSource: DataSource,
  ) { }

  // --- READ METHODS ---

  async findOne(criteria: FindOptionsWhere<User>): Promise<User | null> {
    return this.usersRepository.findOneBy(criteria);
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    this.logger.debug(`Finding user by phoneNumber: ${phoneNumber}`);

    return this.usersRepository.findOne({
      where: { phoneNumber: phoneNumber },
    });
  }

  async findById(userId: string): Promise<User | null> {
    this.logger.debug(`Finding user by userId: ${userId}`);

    return this.usersRepository.findOne({
      where: { id: userId },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`);

    return this.usersRepository.findOne({
      where: { email },
    });
  }

  // --- CREATE / UPDATE METHODS ---

  async createUserByEmail(input: CreateUserInput): Promise<UserPayload> {
    const { email, password, googleId, phoneNumber } = input;

    return this.dataSource.transaction(async (manager) => {
      if (!email) throw new BadRequestException('Email là bắt buộc để tạo user bằng email.');

      const existing = await manager.findOne(User, { where: { email } });
      if (existing) throw new ConflictException('Email đã được sử dụng.');

      const newUser = manager.create(User, {
        email,
        password,
        googleId,
        phoneNumber,
        roles: [Role.USER],
        isEmailVerified: !!googleId,
      });

      const saved = await manager.save(User, newUser);
      this.logger.log(`Created user ${saved.id} via email.`);
      return this.mapToPayload(saved);
    });
  }

  async createUserFromHospital(identity: CreateIdentityInput): Promise<UserPayload> {
    return this.dataSource.transaction(async (manager) => {
      let user = await manager.findOne(User, { where: { phoneNumber: identity.phoneNumber } });
      if (user) {
        this.logger.log(`User ${user.id} already exists in account-service`);
        return this.mapToPayload(user);
      }

      if (!identity.birthYear) {
        throw new BadRequestException('Cannot create user: birthYear not available');
      }

      const password = identity.birthYear.toString();
      const newUser = manager.create(User, {
        phoneNumber: identity.phoneNumber,
        password,
        roles: [Role.USER],
        isEmailVerified: true,
      });

      const saved = await manager.save(User, newUser);
      this.logger.log(`Created user ${saved.id} from hospital account`);

      return this.mapToPayload(saved);
    });
  }

  async findOrCreateFromGoogle(details: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
    googleId: string;
  }): Promise<UserPayload> {
    return this.dataSource.transaction(async (manager) => {
      const { email, fullName, avatarUrl, googleId } = details;

      if (!email) throw new BadRequestException('Email là bắt buộc cho Google login.');

      let user = await manager.findOne(User, { where: { email } });
      if (user) {
        user.googleId = googleId;
        user.avatarUrl = avatarUrl || user.avatarUrl;
        user.isEmailVerified = true;
        await manager.save(User, user);
        this.logger.log(`Updated user ${user.id} with Google info.`);
        return this.mapToPayload(user);
      }

      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = manager.create(User, {
        email,
        fullName: fullName || 'Google User',
        avatarUrl,
        googleId,
        password: randomPassword,
        roles: [Role.USER],
        isEmailVerified: true,
      });

      const saved = await manager.save(User, user);
      this.logger.log(`Created new user ${saved.id} via Google login.`);
      return this.mapToPayload(saved);
    });
  }

  async updatePassword(email: string, newPassword: string): Promise<UserPayload> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    user.password = newPassword;
    const savedUser = await this.usersRepository.save(user);
    return this.mapToPayload(savedUser);
  }

  async updatePasswordByUserId(userId: string, newPassword: string): Promise<UserPayload> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with userId ${userId} not found.`);
    }

    user.password = newPassword;
    const savedUser = await this.usersRepository.save(user);
    return this.mapToPayload(savedUser);
  }

  // --- DEVICE TOKEN MANAGEMENT ---

  async addDeviceToken(
    userId: string,
    token: string,
    type: 'FCM' | 'APN',
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        this.logger.warn(`[addDeviceToken] User not found: ${userId}`);
        return false;
      }

      const tokens = user.deviceTokens || [];
      if (!tokens.some((t) => t.token === token)) {
        tokens.push({ token, type });
        await manager.update(User, userId, { deviceTokens: tokens });
        this.logger.log(`Added ${type} device token for user ${userId}`);
      }
      return true;
    });
  }

  async removeDeviceTokens(
    userId: string,
    tokensToRemove: string[],
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user || !user.deviceTokens) return false;

      const newTokens = user.deviceTokens.filter(
        (t) => !tokensToRemove.includes(t.token),
      );

      if (newTokens.length < user.deviceTokens.length) {
        await manager.update(User, userId, { deviceTokens: newTokens });
        this.logger.log(
          `Removed ${user.deviceTokens.length - newTokens.length} device tokens for user ${userId}`,
        );
      }

      return true;
    });
  }

  private mapToPayload(user: User): UserPayload {
    return {
      id: user.id,
      email: user.email,
      googleId: user.googleId,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      deviceTokens: user.deviceTokens || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
