import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { User } from 'apps/account-service/src/users/entities/user.entity';

@Injectable()
export class AccountApiClientService {
  private readonly logger = new Logger(AccountApiClientService.name);
  private readonly accountServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.accountServiceUrl = this.configService.get<string>('ACCOUNT_SERVICE_URL')!;
    if (!this.accountServiceUrl) {
        throw new Error('ACCOUNT_SERVICE_URL is not defined in environment variables.');
    }
  }
  
  async fetchUserByIdentifier(identifier: string): Promise<User | null> {
      const operationName = 'GetUserByIdentifier';
      const query = `
          query {
              findByIdentifier(identifier: $identifier) {
                  id
                  mabn
                  sodienthoai
                  fcm_tokens
                  apn_tokens
              }
          }
      `;
      const variables = { identifier };

      const payload = {
          operationName,
          query,
          variables,
      };

      this.logger.debug(`[API CALL] Sending request to Account Service with payload:`, JSON.stringify(payload));

      try {
          const response = await firstValueFrom(
              this.httpService.post(
                  this.accountServiceUrl,
                { query },
                  {
                      headers: { 'Content-Type': 'application/json' },
                      timeout: 10000, 
                  }
              )
          );

          if (response.data.errors) {
              this.logger.error('GraphQL errors from Account Service:', response.data.errors);
              return null;
          }

          return response.data.data.findByIdentifier;
      } catch (error) {
          this.logger.error(`Failed to fetch user ${identifier} from Account Service`);
          if (error.response) {
              this.logger.error(`- Status: ${error.response.status}`);
              this.logger.error(`- Data: ${JSON.stringify(error.response.data)}`);
          } else {
              this.logger.error(`- Message: ${error.message}`);
          }
          // Ném lỗi để lớp gọi có thể bắt
          throw new Error('Failed to communicate with Account Service');
      }
  }
}
