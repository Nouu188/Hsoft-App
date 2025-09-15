import { RegisterByEmailInput, RegisterByHospitalInput } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/registration';
import { EntityManager } from 'typeorm';
import { IRepository } from '../../common/interfaces/repository.interface';
import { DeviceTokenInput, User } from '../entities/user.entity';

export const IUserRepository = Symbol('IUserRepository');
export interface IUserRepository extends IRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    
    createByEmail(registerInput: RegisterByEmailInput, manager?: EntityManager): Promise<User>;
    createByGoogle(registerInput: Partial<User>, manager?: EntityManager): Promise<User>;
    createByHospital(registerInput: RegisterByHospitalInput, manager?: EntityManager): Promise<User>;

    updatePasswordByUserId(userId: string, newPassword: string, manager?: EntityManager): Promise<User>;
    updateDeviceTokenByUserId(userId: string, deviceToken: DeviceTokenInput, manager?: EntityManager): Promise<Boolean>;
}