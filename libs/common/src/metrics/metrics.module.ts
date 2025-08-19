import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonMetricsProviders } from './metrics.provider';
import { MetricsMiddleware } from './metrics.middleware';
import { MetricsInterceptor } from './metrics.interceptor';

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
    ...CommonMetricsProviders,
    MetricsMiddleware,
    MetricsInterceptor,
  ],
  exports: [
    PrometheusModule,
    ...CommonMetricsProviders,
    MetricsMiddleware,
    MetricsInterceptor,
  ],
})
export class MetricsModule {}
