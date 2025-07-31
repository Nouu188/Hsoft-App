import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthPayload } from '../dtos/auth.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: AuthPayload) {
    this.logger.debug(`[JwtStrategy] Validating payload:`, payload);
    if (!payload || !payload.sub) {
        this.logger.error('[JwtStrategy] Payload is invalid or missing "sub" (user ID).');
        throw new UnauthorizedException('Invalid token payload.');
    }

    const user = await this.usersService.findOne({ user_id: payload.sub });

    if (!user) {
      this.logger.error(`[JwtStrategy] User not found in DB for ID: ${payload.sub}. Token is likely stale.`);
      throw new UnauthorizedException('User not found.'); // Ném lỗi rõ ràng hơn
    }
    this.logger.debug(`[JwtStrategy] User found successfully:`, { id: user.id });

    return user;
  }
}