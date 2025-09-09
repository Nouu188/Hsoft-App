import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../../../../users/users.service';
import { UserPayload } from '../../../../users/dto/user.payload';
import { GoogleLoginInput } from '../../../dto/login/google-login.input';
import { ILoginStrategy } from '../interfaces/authentication.provider';

export const GOOGLE_OAUTH2_CLIENT = 'GOOGLE_OAUTH2_CLIENT';

@Injectable()
export class GoogleAuthenticationProvider implements ILoginStrategy<GoogleLoginInput> {
  constructor(
    private readonly usersService: UsersService,
    @Inject(GOOGLE_OAUTH2_CLIENT) private readonly googleClient: OAuth2Client,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(input: GoogleLoginInput): Promise<UserPayload> {
    const { idToken } = input;
    const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token or email not provided.');
    }

    const { email, name, picture, sub: googleId } = payload;
    return this.usersService.findOrCreateFromGoogle({
        email, fullName: name, avatarUrl: picture, googleId,
    });
  }
}