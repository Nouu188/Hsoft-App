import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { User } from './entities/user.entity';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
import { HospitalPatient } from '@app/api-clients/hospital/dto/hospitalPatient.dto';
import { isUUID } from 'class-validator';
import { TrackBusinessMetric } from '@app/common/metrics/decorators/track-business-metric.decorator';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';
import { MeasureDuration } from '@app/common/metrics/decorators/measure-duration.decorator';

@Injectable()
export class UsersService {
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
  //   [MetricLabel.REGISTRATION_SOURCE]: 'createUser',
  //   [MetricLabel.TABLE_NAME]: 'users',
  // })
  @TrackBusinessMetric(MetricName.USER_REGISTRATIONS_TOTAL, {
    labels: (args: [HospitalPatient], result: User, error?: any) => ({
      [MetricLabel.REGISTRATION_SOURCE]: 'createUser',
      [MetricLabel.STATUS]: error ? 'error' : 'success',
    }),
  })
  async createUser(payload: HospitalPatient): Promise<User> {
    const { mabn, hoten, namsinh, sodienthoai, socmnd } = payload;

    const newUser = this.usersRepository.create({
      mabn: mabn,
      sodienthoai: sodienthoai,
      socmnd: socmnd,
      hoTen: hoten,
      namsinh: namsinh,
      password: namsinh,
      roles: [Role.USER],
    });

    await newUser.hashPassword();
    return this.usersRepository.save(newUser);
  }
}
