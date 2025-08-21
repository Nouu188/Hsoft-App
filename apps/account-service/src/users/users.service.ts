import { HospitalPatient } from '@app/api-clients/hospital/dto/hospitalPatient.dto';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { TrackBusinessMetric } from '@app/common/metrics/decorators/track-business-metric.decorator';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';
import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { IsNull, Not, Repository } from 'typeorm';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
import { CreateUserByEmailInput, CreateUserByIdentifierInput } from './dto/create-user-input.dto';
import { User } from './entities/user.entity';
import { MeasureDuration } from '@app/common/metrics/decorators/measure-duration.decorator';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User, 'accountConnection')
    private usersRepository: Repository<User>,

    private readonly hospitalClient: HospitalApiClientService,
  ) { }

  async findOne({
    mabn,
    sodienthoai,
    socmnd,
    user_id,
  }: {
    mabn?: string;
    sodienthoai?: string;
    socmnd?: string;
    user_id?: string;
  }): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({
      id: user_id ?? undefined,
      mabn: mabn ?? undefined,
      sodienthoai: sodienthoai ?? undefined,
      socmnd: socmnd ?? undefined,
    });

    return user ?? undefined;
  }

  async addFcmToken(user_id: string, token: string): Promise<boolean> {
    console.log(`[addFcmToken] Called with user_id=${user_id}, token=${token}`);

    const user = await this.usersRepository.findOne({ where: { id: user_id } });
    if (!user) {
      console.warn(`[addFcmToken] User not found with id=${user_id}`);
      return false;
    }

    console.log(`[addFcmToken] Found user: ${user.id}`);
    console.log(`[addFcmToken] Existing FCM tokens:`, user.fcm_tokens);

    if (!user.fcm_tokens) {
      user.fcm_tokens = [];
    }

    if (!user.fcm_tokens.includes(token)) {
      user.fcm_tokens.push(token);
      console.log(`[addFcmToken] Adding new token: ${token}`);
      await this.usersRepository.save(user);
      console.log(`[addFcmToken] Saved user with updated FCM tokens.`);
    } else {
      console.log(`[addFcmToken] Token already exists, skipping.`);
    }

    return true;
  }

  async removeFcmTokens(userId: string, tokensToRemove: string[]): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user || !user.fcm_tokens) {
      return false;
    }

    const initialCount = user.fcm_tokens.length;
    user.fcm_tokens = user.fcm_tokens.filter(token => !tokensToRemove.includes(token));

    if (user.fcm_tokens.length < initialCount) {
      await this.usersRepository.save(user);
      return true;
    }

    return false;
  }

  async findByIdentifier(identifier: string): Promise<User | undefined> {
    if (isUUID(identifier)) {
      return await this.usersRepository.findOne({ where: { id: identifier } }) ?? undefined;
    }

    return await this.usersRepository.findOne({
      where: [
        { mabn: identifier },
        { sodienthoai: identifier },
        { socmnd: identifier },
      ],
    }) ?? undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      throw new ConflictException("Invalid email !");
    }

    return await this.usersRepository.findOne({
      where: {
        email
      }
    }) ?? undefined;
  }

  async findAllUser(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { mabn: Not(IsNull()) },
      select: ['id'],
    })
  }

  async fetchPatientFromHospital(identifier: string) {
    return await this.hospitalClient.fetchPatientFromHospital(identifier);
  }

  // @MeasureDuration(MetricName.USER_REGISTRATIONS_TOTAL, {
  //   [MetricLabel.REGISTRATION_SOURCE]: 'createUserByIdentifier',
  //   [MetricLabel.TABLE_NAME]: 'users',
  // })
  // @TrackBusinessMetric(MetricName.USER_REGISTRATIONS_TOTAL, {
  //   labels: (args: [HospitalPatient], result: User, error?: any) => ({
  //     [MetricLabel.REGISTRATION_SOURCE]: 'createUserByIdentifier',
  //     [MetricLabel.STATUS]: error ? 'error' : 'success',
  //   }),
  // })
  async createUserByIdentifier(payload: CreateUserByIdentifierInput): Promise<User> {
    const { mabn, hoten, namsinh, sodienthoai, socmnd, password } = payload;

    try {
      if (!mabn && !sodienthoai && !socmnd) {
        this.logger.warn(`Thiếu thông tin định danh khi tạo user: ${JSON.stringify(payload)}`);
        throw new BadRequestException('Cần có mã bệnh nhân, số điện thoại hoặc số CMND để tạo user');
      }

      this.logger.debug(
        `Đang tạo user mới: mabn=${mabn ?? 'N/A'}, sdt=${sodienthoai ?? 'N/A'}, socmnd=${socmnd ?? 'N/A'}`
      );

      const rawPassword = password || (namsinh && `${namsinh}`);

      let newUser = this.usersRepository.create({
        mabn,
        sodienthoai,
        socmnd,
        hoten,
        namsinh,
        password: rawPassword,
        roles: [Role.USER],
      });

      const savedUser = await this.usersRepository.save(newUser);
      this.logger.log(`Tạo user thành công: id=${savedUser.id}, email=${savedUser.email ?? 'N/A'}`);

      return savedUser;
    } catch (error) {
      this.logger.error(`Lỗi khi tạo user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Không thể tạo user, vui lòng thử lại');
    }
  }

  // @MeasureDuration(MetricName.USER_REGISTRATIONS_TOTAL, {
  //   [MetricLabel.REGISTRATION_SOURCE]: 'createUserByIEmail',
  //   [MetricLabel.TABLE_NAME]: 'users',
  // })
  // @TrackBusinessMetric(MetricName.USER_REGISTRATIONS_TOTAL, {
  //   labels: (args: [HospitalPatient], result: User, error?: any) => ({
  //     [MetricLabel.REGISTRATION_SOURCE]: 'createUserByEmail',
  //     [MetricLabel.STATUS]: error ? 'error' : 'success',
  //   }),
  // })
  async createUserByEmail(payload: CreateUserByEmailInput): Promise<User> {
    const { email, password, hoten } = payload;

    try {
      if (!email || !password) {
        this.logger.warn(`Thiếu email hoặc password khi tạo user: ${JSON.stringify(payload)}`);
        throw new BadRequestException('Email và mật khẩu là bắt buộc');
      }

      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser) {
        this.logger.warn(`Email đã tồn tại: ${email}`);
        throw new ConflictException('Email đã được sử dụng');
      }

      this.logger.debug(`Tạo user mới bằng email: ${email}`);

      const newUser = this.usersRepository.create({
        email,
        hoten,
        password,
        roles: [Role.USER],
      });

      const savedUser = await this.usersRepository.save(newUser);
      this.logger.log(`Tạo user thành công: id=${savedUser.id}, email=${savedUser.email}`);

      return savedUser;
    } catch (error) {
      this.logger.error(`Lỗi khi tạo user bằng email: ${error.message}`, error.stack);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Không thể tạo user, vui lòng thử lại');
    }
  }

}
