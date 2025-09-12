import { YLenhThuoc } from '@app/common/types/ylenhthuoc.interface';
import { Dose, DoseStatus, MealRelation } from 'apps/scheduling-service copyy/src/doses/entities/dose.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Chuẩn hoá dữ liệu ylenhthuoc (từ HIS) thành bản ghi Dose
 */
export function normalizeYLenhThuocToDose(
  ylenh: YLenhThuoc,
  userId: string,
): Partial<Dose> {
  const dueAt = parseDateFromYLenh(ylenh.ngay, ylenh.thoidiem);
  const notifyAt = calculateNotifyAt(dueAt);

  const mealRelation = extractMealRelation(ylenh.lieudung);

  return {
    id: uuidv4(), // có thể để DB tự generate nếu dùng @PrimaryGeneratedColumn
    external_id: `${ylenh.id}_${ylenh.stt}`, // tạo unique external_id
    ylenh_id: ylenh.id,
    ylenh_stt: ylenh.stt,
    due_at: dueAt,
    notify_at: notifyAt,
    status: DoseStatus.UPCOMING,
    userId,
    medication_name: ylenh.tenthuoc,
    dosage_instructions: ylenh.lieudung,
    usage_instructions: ylenh.thoidiem,
    skipReasonCategory: null,
    skipReasonDetail: null,
    meal_relation: mealRelation,
  };
}

/**
 * Parse ngày + thời điểm từ ylenh (thường HIS trả về string)
 */
function parseDateFromYLenh(ngay: string, thoidiem: string): Date {
  try {
    // giả sử ngay = "2025-08-28", thoidiem = "08:00"
    return new Date(`${ngay}T${thoidiem}:00+07:00`);
  } catch {
    return new Date();
  }
}

/**
 * Notify trước khi uống 10 phút
 */
function calculateNotifyAt(dueAt: Date): Date {
  const notify = new Date(dueAt);
  notify.setMinutes(notify.getMinutes() - 10);
  return notify;
}

/**
 * Extract quan hệ bữa ăn từ lieudung (ví dụ: "Uống sau ăn 30 phút")
 */
function extractMealRelation(lieudung?: string): MealRelation | null {
  if (!lieudung) return null;

  const text = lieudung.toLowerCase();

  if (text.includes('sau ăn')) {
    const minutes = parseInt(text.match(/\d+/)?.[0] ?? '0', 10);
    return { type: 'AFTER', minutes };
  }
  if (text.includes('trước ăn')) {
    const minutes = parseInt(text.match(/\d+/)?.[0] ?? '0', 10);
    return { type: 'BEFORE', minutes };
  }
  if (text.includes('cùng ăn') || text.includes('trong bữa ăn')) {
    return { type: 'WITH' };
  }

  return null;
}
