import { Controller, Post, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ServiceClient } from './entities/service-client.entity';
import { M2MAuthGuard } from './guards/m2m-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(M2MAuthGuard)
  issueM2MToken(@Req() req: Request) {
    return this.authService.generateM2MToken(req.user as ServiceClient);
  }
}