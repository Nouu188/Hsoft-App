import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { Role } from '@app/auth';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import * as crypto from "node:crypto";
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserByEmailInput } from './dto/create-user-input.dto';
import { User } from './entities/user.entity';
import { HospitalConnection } from './entities/hospital-connection.entity';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User, 'accountConnection') private readonly usersRepository: Repository<User>,
    @InjectRepository(HospitalConnection, 'accountConnection') private readonly hospitalConnectionRepository: Repository<HospitalConnection>,
    private readonly tenantApiClient: TenantApiClientService,
    private readonly hospitalClient: HospitalApiClientService,
  ) { }

  // ===================================================================
  // PHƯƠNG THỨC TÌM KIẾM (READ)
  // ===================================================================

  async findOne(criteria: FindOptionsWhere<User>): Promise<User | null> {
    return this.usersRepository.findOneBy(criteria);
  }
  
  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    this.logger.debug(`Finding user by identifier: ${identifier}`);
    if (isUUID(identifier)) {
      return this.findOne({ id: identifier });
    }
    return this.usersRepository.findOne({
      where: [{ email: identifier }, { sodienthoai: identifier }, { mabn: identifier }],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`);
    return this.findOne({ email });
  }

  // ===================================================================
  // PHƯƠNG THỨC TẠO VÀ CẬP NHẬT (WRITE)
  // ===================================================================

  async createUserByEmail(input: CreateUserByEmailInput): Promise<User> {
    this.logger.log(`Attempting to create user by email: ${input.email}`);
    const existingUser = await this.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng.');
    }

    const newUser = this.usersRepository.create({
      email: input.email,
      hoten: input.hoten,
      password: input.password,
      roles: [Role.USER],
      isEmailVerified: false,
    });

    const savedUser = await this.usersRepository.save(newUser);
    this.logger.log(`Successfully created user ${savedUser.id} via email.`);
    return savedUser;
  }

  async createUserFromHospitalPatient(hospitalPatient: any): Promise<User> {
    this.logger.log(`Attempting to create user from hospital patient data for mabn: ${hospitalPatient.mabn}`);

    const newUser = this.usersRepository.create({
      mabn: hospitalPatient.mabn,
      hoten: hospitalPatient.hoten,
      namsinh: hospitalPatient.namsinh,
      sodienthoai: hospitalPatient.sodienthoai,
      password: hospitalPatient.namsinh,
      roles: [Role.USER],
      isEmailVerified: true, // Coi như đã xác thực qua hệ thống BV
    });

    const savedUser = await this.usersRepository.save(newUser);
    this.logger.log(`Successfully created user ${savedUser.id} from hospital data.`);
    return savedUser;
  }

  async findOrCreateFromGoogle(details: { email: string; hoten?: string; avatarUrl?: string; googleId: string }): Promise<User> {
    this.logger.log(`Finding or creating user for Google email: ${details.email}`);
    const existingUser = await this.findByEmail(details.email);

    if (existingUser) {
      existingUser.googleId = details.googleId;
      existingUser.avatarUrl = details.avatarUrl || existingUser.avatarUrl;
      existingUser.isEmailVerified = true;
      await this.usersRepository.save(existingUser);
      this.logger.log(`Found and updated existing user ${existingUser.id} with Google info.`);
      return existingUser;
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');

    const newUser = this.usersRepository.create({
      email: details.email,
      hoten: details.hoten || 'Người dùng Google',
      avatarUrl: details.avatarUrl,
      googleId: details.googleId,
      password: randomPassword,
      isEmailVerified: true,
      roles: [Role.USER],
    });

    const savedUser = await this.usersRepository.save(newUser);
    this.logger.log(`Created new user ${savedUser.id} from Google sign-in.`);
    return savedUser;
  }

  // ===================================================================
  // QUẢN LÝ TOKEN VÀ LIÊN KẾT
  // ===================================================================

  async addFcmToken(userId: string, token: string): Promise<boolean> {
    const user = await this.findOne({ id: userId });
    if (!user) {
      this.logger.warn(`[addFcmToken] User not found: ${userId}`);
      return false;
    }

    const tokens = user.fcmTokens || [];
    if (!tokens.includes(token)) {
      await this.usersRepository.update(userId, { fcmTokens: [...tokens, token] });
      this.logger.log(`Added FCM token for user ${userId}`);
    }
    return true;
  }

  async removeFcmTokens(userId: string, tokensToRemove: string[]): Promise<boolean> {
    const user = await this.findOne({ id: userId });
    if (!user || !user.fcmTokens) return false;

    const newTokens = user.fcmTokens.filter(t => !tokensToRemove.includes(t));
    if (newTokens.length < user.fcmTokens.length) {
      await this.usersRepository.update(userId, { fcmTokens: newTokens });
      this.logger.log(`Removed ${user.fcmTokens.length - newTokens.length} FCM tokens for user ${userId}`);
    }
    return true;
  }

  async linkToHospital(userId: string, hospitalId: string): Promise<HospitalConnection> {
    this.logger.log(`User ${userId} attempting to link to hospital ${hospitalId}.`);

    // 1. Kiểm tra xem liên kết đã tồn tại hay chưa để tránh xử lý thừa
    const existingConnection = await this.hospitalConnectionRepository.findOneBy({ userId, hospitalId });
    if (existingConnection) {
      this.logger.warn(`User ${userId} is already linked to hospital ${hospitalId}. Returning existing connection.`);
      return existingConnection;
    }

    // 2. Lấy thông tin chi tiết của người dùng và bệnh viện song song để tối ưu
    const [user, hospital] = await Promise.all([
      this.usersRepository.findOneBy({ id: userId }),
      this.tenantApiClient.getHospitalById(hospitalId),
    ]);

    if (!user) {
      // Lỗi này không nên xảy ra nếu request đã qua JwtAuthGuard
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    if (!hospital) {
      throw new BadRequestException(`Bệnh viện với ID ${hospitalId} không hợp lệ hoặc không tồn tại.`);
    }

    // 3. Xác định thông tin định danh để tìm kiếm trên hệ thống bệnh viện
    // Ưu tiên CMND/CCCD, nếu không có thì dùng SĐT
    const identifier = user.socmnd || user.sodienthoai;
    if (!identifier) {
      throw new BadRequestException('Vui lòng cập nhật số CMND/CCCD hoặc SĐT trong hồ sơ để thực hiện liên kết.');
    }
    
    this.logger.debug(`Using identifier '${identifier}' to find patient at hospital ${hospital.name}`);

    // 4. Gọi API của bệnh viện đó để xác thực và lấy mã bệnh nhân (mabn)
    const patientInfo = await this.hospitalClient.fetchPatientFromHospital(
      // hospital.graphqlEndpoint,
      identifier,
    );

    if (!patientInfo || !patientInfo.mabn) {
      this.logger.warn(`Patient identifier '${identifier}' not found at hospital ${hospital.name} (ID: ${hospitalId})`);
      throw new NotFoundException('Không tìm thấy thông tin của bạn tại bệnh viện này. Vui lòng kiểm tra lại CMND/CCCD/SĐT đã đăng ký.');
    }

    // 5. Tạo và lưu liên kết mới
    const newConnection = this.hospitalConnectionRepository.create({
      userId,
      hospitalId,
      patientCodeAtHospital: patientInfo.mabn,
    });

    try {
      const savedConnection = await this.hospitalConnectionRepository.save(newConnection);
      this.logger.log(`Successfully linked user ${userId} to hospital ${hospitalId} with mabn ${patientInfo.mabn}`);
      
      // (Tùy chọn) Nếu user chưa có mabn, cập nhật mabn chính cho user
      if (!user.mabn) {
        user.mabn = patientInfo.mabn;
        await this.usersRepository.save(user);
        this.logger.log(`Updated primary 'mabn' for user ${userId}.`);
      }

      return savedConnection;
    } catch (error) {
      // Bắt lỗi unique constraint (trường hợp race condition)
      if (error.code === '23505') { // Mã lỗi unique violation của PostgreSQL
        this.logger.warn(`Race condition detected: User ${userId} link to hospital ${hospitalId} was created by another process.`);
        // Trả về liên kết đã tồn tại
        return this.hospitalConnectionRepository.findOneByOrFail({ userId, hospitalId });
      }
      this.logger.error(`Failed to save hospital connection for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Không thể tạo liên kết bệnh viện do lỗi hệ thống.');
    }
  }
}