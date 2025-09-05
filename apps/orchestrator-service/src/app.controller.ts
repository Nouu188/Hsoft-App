import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { OrchestratorService } from './app.service';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';

@Controller()
export class OrchestratorController {
  private readonly logger = new Logger(OrchestratorController.name);

  constructor(private readonly orchestratorService: OrchestratorService) {}

  @EventPattern(RoutingKey.USER_FIRST_LOGIN_IDENTITY)
  async handleUserCreated(@Payload() data: { userId: string; email: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`SAGA START: UserCreated received for userId=${data.userId}`);
      await this.orchestratorService.handleUserCreated(data);
      channel.ack(originalMsg);
      this.logger.log(`SAGA END: UserCreated processed for userId=${data.userId}`);
    } catch (error) {
      this.logger.error(`SAGA ERROR: UserCreated failed for userId=${data.userId}`, error);
      channel.nack(originalMsg);
    }
  }
}
