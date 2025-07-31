import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard này sử dụng 'client-credentials' strategy để xác thực client_id và client_secret
@Injectable()
export class M2MAuthGuard extends AuthGuard('client-credentials') {}