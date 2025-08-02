import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { User } from './entities/user.entity';
import { Role } from '../../../../libs/auth/src/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
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

  async fetchPatientFromHospital(identifier: string) {
    return await this.hospitalClient.fetchPatientFromHospital(identifier);
  }

  async createUser(payload: {
    mabn: string,
    hoten: string,
    ngaysinh: string,
    diachi: string,
    sodienthoai: string,
    socmnd: string,
  }): Promise<User> {
    const { mabn, hoten, ngaysinh, diachi, sodienthoai, socmnd } = payload;
    const yearOfBirth = ngaysinh.split('/')[2];

    const newUser = this.usersRepository.create({
      mabn: mabn,
      sodienthoai: sodienthoai,
      socmnd: socmnd,
      hoTen: hoten,
      ngaysinh: moment(ngaysinh, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      diachi: diachi,
      password: yearOfBirth, 
      roles: [Role.USER],
    });

    await newUser.hashPassword();
    return this.usersRepository.save(newUser);
  }
}
