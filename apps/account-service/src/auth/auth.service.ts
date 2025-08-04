import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceClient } from './entities/service-client.entity';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from '../../../../libs/auth/src/dtos/auth.payload';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
import { CreateServiceClientInput } from './dto/create-service-client.input';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(ServiceClient, 'authConnection')
        private serviceClientRepository: Repository<ServiceClient>,
    ) {}

    async login(loginInput: LoginInput): Promise<{user: User, accessToken: string}> {
        const { identifier, password } = loginInput;

        let user = await this.usersService.findByIdentifier(identifier);
        if (user) {
            const isPasswordMatching = await bcrypt.compare(password!, user.password);
            if(isPasswordMatching) {
                this.logger.log(`User ${user.sodienthoai} logged in from internal DB.`);
                const accessToken = this.generateToken(user.id, user.roles);
                return { accessToken, user };
            }

            throw new UnauthorizedException("Invalid credentials");
        }

        this.logger.log(`User with identifier "${identifier}" not found. Attempting to fetch from hospital API...`);
        
        const hospitalPatient = await this.usersService.fetchPatientFromHospital(identifier);
        if (!hospitalPatient) {
            throw new UnauthorizedException('Patient information not found in hospital system.');
        }

        const yearOfBirth = hospitalPatient.namsinh;
        if (loginInput.password !== yearOfBirth) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        this.logger.log(`First-time login successful for mabn ${hospitalPatient.mabn}. Creating local user...`);
        user = await this.usersService.createUser(hospitalPatient);

        const { password: _password, ...userResult } = user;
        const accessToken = this.generateToken(userResult.id, userResult.roles);

        return { accessToken, user: userResult as User}
    }

    private generateToken(user_id: string, roles: Role[]): string {
        const payload: AuthPayload = {
            sub: user_id,
            roles,
        };
        return this.jwtService.sign(payload);
    }

    generateM2MToken(client: ServiceClient): { accessToken: string } {
        const payload: AuthPayload = {
            sub: client.client_id,
            scopes: client.scopes,
        };
        return { accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }) };
    }

  async createServiceClient(input: CreateServiceClientInput): Promise<Partial<ServiceClient>> {
    const newClient = this.serviceClientRepository.create(input);
    // Mật khẩu sẽ được hash tự động bởi hook @BeforeInsert trong entity
    await this.serviceClientRepository.save(newClient);
    const { client_secret, ...res } = newClient;

    return res;
  }
}
