import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class M2MJwtGuard extends AuthGuard('m2m-jwt') {}