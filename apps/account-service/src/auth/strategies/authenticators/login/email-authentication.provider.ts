import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../../../users/users.service';
import { UserPayload } from '../../../../users/dto/user.payload';
import { LoginInputByEmail } from '../../../dto/login/login.input';
import { ILoginStrategy } from '../interfaces/authentication.provider';

@Injectable()
export class EmailAuthenticationProvider implements ILoginStrategy<LoginInputByEmail> {
  constructor(private readonly usersService: UsersService) {}

  async authenticate(input: LoginInputByEmail): Promise<UserPayload> {
    const { email, password } = input;
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set for this user.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
}