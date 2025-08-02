import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class M2MAuthGuard extends AuthGuard('client-credentials') {}