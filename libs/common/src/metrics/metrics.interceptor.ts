import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { MetricName, MetricLabel } from './metrics.contracts';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(
        @InjectMetric(MetricName.GRAPHQL_REQUESTS_DURATION_SECONDS)
        private readonly requestDuration: Histogram<string>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType<'graphql'>() !== 'graphql') {
            return next.handle();
        }

        const ctx = GqlExecutionContext.create(context);
        const info = ctx.getInfo();

        const operationName = info?.fieldName ?? 'unknown';
        const operationType = info?.operation?.operation ?? 'unknown';

        const end = this.requestDuration.startTimer();

        return next.handle().pipe(
            tap({
                next: () => {
                    end({
                        [MetricLabel.OPERATION_NAME]: operationName,
                        [MetricLabel.OPERATION_TYPE]: operationType,
                        [MetricLabel.STATUS]: 'success',
                    });
                },
                error: () => {
                    end({
                        [MetricLabel.OPERATION_NAME]: operationName,
                        [MetricLabel.OPERATION_TYPE]: operationType,
                        [MetricLabel.STATUS]: 'error',
                    });
                },
            }),
        );
    }
}