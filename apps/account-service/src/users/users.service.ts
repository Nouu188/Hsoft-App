import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { User } from './entities/user.entity';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
import { HospitalPatient } from '@app/api-clients/hospital/dto/hospitalPatient.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'accountConnection')
    private usersRepository: Repository<User>,

    private readonly hospitalClient: HospitalApiClientService,
  ) {}

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
    const user = await this.usersRepository.findOne({ where: { id: user_id } });
    if (!user) {
      return false;
    }

    if (!user.fcm_tokens) {
      user.fcm_tokens = [];
    }

    if (!user.fcm_tokens.includes(token)) {
      user.fcm_tokens.push(token);
      await this.usersRepository.save(user);
    }

    return true;
  }

  async findByIdentifier(identifier: string): Promise<User | undefined> {
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
