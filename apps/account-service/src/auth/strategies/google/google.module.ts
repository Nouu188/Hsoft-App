import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";

export const GOOGLE_OAUTH2_CLIENT = 'GOOGLE_OAUTH2_CLIENT';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: GOOGLE_OAUTH2_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured!');
        return new OAuth2Client(clientId);
      },
    },
  ],
  exports: [GOOGLE_OAUTH2_CLIENT],
})
export class GoogleModule {}
