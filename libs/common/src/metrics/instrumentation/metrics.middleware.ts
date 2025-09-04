// libs/common/src/metrics/metrics.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { MetricName, MetricLabel } from '../contracts/metrics.contracts';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(
    @InjectMetric(MetricName.HTTP_REQUESTS_DURATION_SECONDS)
    private readonly requestDuration: Histogram<string>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/metrics') {
      return next();
    }

    const end = this.requestDuration.startTimer();

    res.on('finish', () => {
      end({
        [MetricLabel.METHOD]: req.method,
        [MetricLabel.ROUTE]: req.route ? req.route.path : req.originalUrl,
        [MetricLabel.STATUS_CODE]: res.statusCode,
      });
    });

    next();
  }
}