import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from 'apps/account-service/src/domain/users/interfaces/user.repository.interface';
import { TokenService } from 'apps/account-service/src/infrastructure/common/services/token.service';
import { LoginResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login.response';
import { OAuth2Client } from 'google-auth-library';
import * as crypto from 'node:crypto';
import { LoginByGoogleCommand } from '../LoginByGoogle.command';

export const GOOGLE_OAUTH2_CLIENT = 'GOOGLE_OAUTH2_CLIENT';

@CommandHandler(LoginByGoogleCommand)
export class LoginByGoogleHandler implements ICommandHandler<LoginByGoogleCommand, LoginResponse> {
  private readonly logger = new Logger(LoginByGoogleHandler.name);

  constructor(
    @Inject(GOOGLE_OAUTH2_CLIENT) private readonly googleClient: OAuth2Client,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginByGoogleCommand): Promise<LoginResponse> {
    const { idToken } = command.input;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token or email not provided.');
    }

    const { email, name: fullName, picture: avatarUrl, sub: googleId } = payload;

    if (!email) throw new BadRequestException('Email là bắt buộc cho Google login.');

    let user = await this.userRepository.findByEmail(email);

    if (user) {
      user.googleId = googleId;
      user.avatarUrl = avatarUrl || user.avatarUrl;
      user.isEmailVerified = true;

      user = await this.userRepository.save(user);
      this.logger.log(`Updated user ${user.id} with Google info.`);
    } else {
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = await this.userRepository.createByGoogle({
        email,
        avatarUrl,
        googleId,
        password: randomPassword,
        isEmailVerified: true,
      });

      this.logger.log(`Created new user ${user.id} via Google login.`);
    }

    const tokenPair = await this.tokenService.generateTokenPair(user);

    return {
      user,
      ...tokenPair,
    };
  }
}
