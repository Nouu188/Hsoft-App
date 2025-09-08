import { Controller, Post, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { M2MAuthGuard } from '../auth/guards/m2m-auth.guard';
import { ServiceClient } from '../auth/entities/service-client.entity';
import { M2mService } from './m2m.service';

@Controller('auth')
export class M2mController {
  constructor(private m2mService: M2mService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(M2MAuthGuard)
  issueM2MToken(@Req() req: Request) {
    return this.m2mService.generateM2MToken(req.user as ServiceClient);
  }
}