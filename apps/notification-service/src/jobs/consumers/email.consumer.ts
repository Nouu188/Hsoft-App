import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { QueueName } from '@app/common/rabbitmq/queues';
import { SendTransactionalEmailCommand } from '../dto/send-transactional-email.command';
import { EmailService } from '../services/email.service';

@Injectable()
export class EmailConsumer {
    private readonly logger = new Logger(EmailConsumer.name);

    constructor(private readonly emailService: EmailService) {}

    @RabbitSubscribe({
        exchange: ExchangeName.COMMANDS,
        routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL_COMMAND,
        queue: QueueName.NOTIFICATION_SEND_EMAIL, 
    })
    public async handleSendEmail(
        command: SendTransactionalEmailCommand
    ): Promise<void | Nack> {
        this.logger.debug(`Received SEND_TRANSACTIONAL_EMAIL_COMMAND for ${command.to}`);
        
        try {
            await this.emailService.sendTransactionalEmail(command);
        } catch (error) {
            return new Nack(false);
        }
    }
}