import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ServiceClient } from 'apps/account-service/src/domain/auth/entities/service-client.entity';
import { IServiceClientRepository } from 'apps/account-service/src/domain/auth/interfaces/service-client.repository.interface';
import { AuthTransactionService } from 'apps/account-service/src/infrastructure/common/services';
import { CreateServiceClientCommand } from '../CreateServiceClient.command';

@CommandHandler(CreateServiceClientCommand)
export class CreateServiceClientHandler
    implements ICommandHandler<CreateServiceClientCommand, Partial<ServiceClient>> {
    private readonly logger = new Logger(CreateServiceClientHandler.name);

    constructor(
        @Inject(IServiceClientRepository) private readonly serviceClientRepo: IServiceClientRepository,
        private readonly transactionService: AuthTransactionService,
    ) { }

    async execute(command: CreateServiceClientCommand): Promise<Partial<ServiceClient>> {
        return this.transactionService.execute(async (manager) => {
            this.logger.debug(`Executing CreateServiceClientCommand for ${command.input.name}`);
    
            const { input } = command;
    
            const newClient = this.serviceClientRepo.create(input);
    
            await this.serviceClientRepo.save(newClient);
    
            const { clientSecret, ...result } = newClient;
            this.logger.log(`Service client ${result.name} created successfully with clientId: ${result.clientId}`);
    
            return result;
        })
    }
}
