import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    this.logger.debug(`[Guard] Intercepting request. Auth Header: ${ctx.getContext().req.headers.authorization ? 'Present' : 'Missing'}`);

    return ctx.getContext().req;
  }
}