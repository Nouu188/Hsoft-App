// libs/common/src/graphql/datetime.scalar.ts

import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', (type) => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type';

  // Chuyển đổi giá trị từ client (string) thành giá trị cho resolver (Date)
  parseValue(value: unknown): Date {
    if (typeof value !== 'string' || !this.isValidDate(value)) {
      throw new Error('GraphQL DateTime Scalar parser expected a valid ISO 8601 date string');
    }
    return new Date(value);
  }

  // Chuyển đổi giá trị từ resolver (Date) thành giá trị gửi cho client (string)
  serialize(value: unknown): string {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      // Đây là nơi lỗi của bạn xảy ra. Chúng ta sẽ log để xem giá trị là gì.
      console.error('[DateTimeScalar] Attempted to serialize invalid date:', value);
      // Thay vì trả về null, chúng ta có thể ném lỗi hoặc trả về một chuỗi rỗng
      // nhưng ném lỗi sẽ giúp debug tốt hơn.
      throw new Error('GraphQL DateTime Scalar serializer expected a valid Date object');
    }
    return value.toISOString(); // Luôn trả về chuỗi ISO 8601 chuẩn
  }

  // Chuyển đổi giá trị từ query literal (AST) thành giá trị cho resolver (Date)
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      if (this.isValidDate(ast.value)) {
        return new Date(ast.value);
      }
    }
    throw new Error('GraphQL DateTime Scalar parser expected a valid ISO 8601 date string');
  }

  private isValidDate(dateString: string): boolean {
    const d = new Date(dateString);
    return d instanceof Date && !isNaN(d.getTime());
  }
}