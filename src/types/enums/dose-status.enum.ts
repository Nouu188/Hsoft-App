export enum DoseStatus {
  UPCOMING = 'UPCOMING', // Sắp tới (chưa đến giờ)
  PENDING = 'PENDING',   // Đang chờ uống (đã đến giờ nhưng chưa quá hạn)
  TAKEN = 'TAKEN',     // Đã uống
  SKIPPED = 'SKIPPED',   // Bỏ qua (do người dùng chủ động)
  MISSED = 'MISSED',     // Đã bỏ lỡ (quá hạn)
}