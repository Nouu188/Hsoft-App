import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from './instrumentation/metrics.interceptor';
import { MetricsMiddleware } from './instrumentation/metrics.middleware';
import { AllMetricsProviders } from './providers';

@Global()
@Module({
  imports: [
    ConfigModule,
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        path: '/metrics',
        defaultLabels: {
          app: configService.get<string>('NPM_PACKAGE_NAME') || 'unknown',
        },
      }),
    }),
  ],
  providers: [
    ...AllMetricsProviders,
    MetricsMiddleware,
    MetricsInterceptor,
  ],
  exports: [
    PrometheusModule,
    ...AllMetricsProviders,
    MetricsMiddleware,
    MetricsInterceptor,
  ],
})
export class MetricsModule { }
