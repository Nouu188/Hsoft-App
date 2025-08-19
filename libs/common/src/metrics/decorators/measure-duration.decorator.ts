import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';

/**
 * Một Method Decorator tùy chỉnh để tự động đo lường thời gian thực thi của một phương thức
 * và ghi nhận vào một Prometheus Histogram.
 *
 * @param metricName Tên của Histogram đã được đăng ký (ví dụ: 'db_query_duration_seconds').
 * @param labels Các label tĩnh sẽ được đính kèm vào metric.
 */
export function MeasureDuration(metricName: string, labels: Record<string, string> = {}) {
  const injectMetric = InjectMetric(metricName);

  return (
    target: any, 
    propertyKey: string, 
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    // Inject metric vào class instance tại thời điểm runtime
    injectMetric(target, `__metric__${propertyKey}`);

    // Thay thế phương thức gốc bằng một hàm mới
    descriptor.value = async function (...args: any[]) {
      const metric: Histogram<string> = this[`__metric__${propertyKey}`];

      if (!metric) {
        // Nếu metric chưa được inject, chỉ cần chạy phương thức gốc
        return originalMethod.apply(this, args);
      }

      const end = metric.startTimer();
      try {
        const result = await originalMethod.apply(this, args);
 
        end({ ...labels, status: 'success' });
        return result;
      } catch (error) {

        end({ ...labels, status: 'error' });
        throw error;
      }
    };
  };
}