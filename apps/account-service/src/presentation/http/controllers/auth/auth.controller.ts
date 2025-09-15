import { Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ServiceClient } from 'apps/account-service/src/domain/auth/entities/service-client.entity';
import { M2MAuthGuard } from '../../../graphql/guards';
import { Request } from 'express';
import { GenerateM2mTokenCommand } from 'apps/account-service/src/application';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('m2m')
  @HttpCode(HttpStatus.OK)
  @UseGuards(M2MAuthGuard)
  async issueM2MToken(@Req() req: Request) {
    const serviceClient = req.user as ServiceClient;
    return this.commandBus.execute(new GenerateM2mTokenCommand(serviceClient));
  }
}
