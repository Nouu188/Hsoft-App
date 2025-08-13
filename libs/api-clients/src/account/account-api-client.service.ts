import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { AuthApiClientService } from '../auth/auth-api-client.service';

@Injectable()
export class AccountApiClientService {
    private readonly logger = new Logger(AccountApiClientService.name);
    private readonly accountServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly authApiClient: AuthApiClientService,
    ) {
        this.accountServiceUrl = this.configService.get<string>('ACCOUNT_SERVICE_URL') + '/graphql';

        if (!this.accountServiceUrl) {
            throw new Error('ACCOUNT_SERVICE_URL is not defined in environment variables.');
        }
    }

    async fetchAllUser(): Promise<User[]> {
        const token = await this.authApiClient.getM2MToken();

        const operationName = 'GetAllUser';
        const query = `
          query {
              findAllUser() {
                  id
              }
          }
      `;

        const payload = {
            operationName,
            query,
        };

        this.logger.debug(`[API CALL] Sending request to Account Service with payload:`, JSON.stringify(payload));

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    this.accountServiceUrl,
                    { query },
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}` 
                        },
                        timeout: 10000,
                    }
                )
            );

            if (response.data.errors) {
                this.logger.error('GraphQL errors from Account Service:', response.data.errors);
                return [];
            }

            return response.data.data.findByIdentifier;
        } catch (error) {
            this.logger.error(`Failed to fetch all users from Account Service`);
            if (error.response) {
                this.logger.error(`- Status: ${error.response.status}`);
                this.logger.error(`- Data: ${JSON.stringify(error.response.data)}`);
            } else {
                this.logger.error(`- Message: ${error.message}`);
            }
            throw new Error('Failed to communicate with Account Service');
        }
    }

    async fetchUserByIdentifier(identifier: string): Promise<User | null> {
        const token = await this.authApiClient.getM2MToken();

        const operationName = 'GetUserByIdentifier';
        const query = `
            query GetUserByIdentifier($identifier: String!) {
                findByIdentifier(identifier: $identifier) {
                    id
                    mabn
                    sodienthoai
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
                    payload,
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}` 
                        },
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
            throw new Error('Failed to communicate with Account Service');
        }
    }

  async removeFcmTokens(userId: string, tokensToRemove: string[]): Promise<void> {
    if (!tokensToRemove || tokensToRemove.length === 0) {
      return; 
    }

    this.logger.log(`Requesting to remove ${tokensToRemove.length} invalid token(s) for user ${userId}.`);
    
    const m2mToken = await this.authApiClient.getM2MToken();

    const mutation = `
      mutation RemoveFcmTokens($userId: ID!, $tokens: [String!]!) {
        removeFcmTokens(userId: $userId, tokens: $tokens)
      }
    `;
    
    const payload = {
      query: mutation,
      variables: {
        userId,
        tokens: tokensToRemove,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.accountServiceUrl,
          payload,
          {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${m2mToken}` 
            },
            timeout: 15000,
          }   
        )
      );

      if (response.data.errors) {
        this.logger.error(`GraphQL errors while removing FCM tokens for user ${userId}:`, response.data.errors);
      } else if (response.data.data.removeFcmTokens) {
        this.logger.log(`Successfully requested token removal for user ${userId}.`);
      } else {
        this.logger.warn(`Token removal mutation for user ${userId} did not return a success value.`);
      }

    } catch (error) {
      // Log lỗi chi tiết nhưng không ném lại để không gây Nack cho message gốc
      this.logger.error(`Failed to send token removal request for user ${userId}. This is a non-critical error.`, error.response?.data || error.message);
    }
  }
}
