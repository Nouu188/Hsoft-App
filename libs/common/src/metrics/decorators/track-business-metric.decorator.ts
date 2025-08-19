// libs/common/src/metrics/track-business-metric.decorator.ts (File mới)

import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

// Định nghĩa kiểu cho các hàm extractor
type LabelExtractor<T> = (args: any[], result: T | undefined, error?: any) => Record<string, string>;
type ValueExtractor = (args: any[], result: any, error?: any) => number;

interface TrackMetricOptions<T> {
  // Hàm để trích xuất các label động
  labels: LabelExtractor<T>;
  // (Tùy chọn) Hàm để trích xuất giá trị cho counter. Mặc định là 1.
  value?: ValueExtractor;
}

/**
 * Một Method Decorator tùy chỉnh để ghi nhận một Prometheus Counter cho một sự kiện nghiệp vụ.
 * Nó cho phép trích xuất các label và giá trị một cách linh hoạt từ các tham số,
 * kết quả trả về, hoặc lỗi của phương thức.
 *
 * @param metricName Tên của Counter đã được đăng ký.
 * @param options Các tùy chọn để trích xuất label và giá trị động.
 */
export function TrackBusinessMetric<T = any>(metricName: string, options: TrackMetricOptions<T>) {
  const injectMetric = InjectMetric(metricName);

  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    injectMetric(target, `__metric__${propertyKey}`);

    descriptor.value = async function (...args: any[]) {
      const metric: Counter<string> = this[`__metric__${propertyKey}`];
      let result: T | undefined = undefined;
      let error: any;

      try {
        result = await originalMethod.apply(this, args);
        return result;
      } catch (e) {
        error = e;
        throw error;
      } finally {
        if (metric) {
          // Lấy các label và giá trị động bằng cách gọi các hàm extractor
          const dynamicLabels = options.labels(args, result, error);
          const dynamicValue = options.value ? options.value(args, result, error) : 1;

          // Ghi nhận metric
          metric.inc(dynamicLabels, dynamicValue);
        }
      }
    };
  };
}