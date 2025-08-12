export enum GroupedDoseStatus {
  UPCOMING = 'UPCOMING', // Tất cả các liều đều là UPCOMING
  ACTIVE = 'ACTIVE',     // Ít nhất một liều là PENDING và đang trong khung giờ uống
  COMPLETED = 'COMPLETED', // Tất cả các liều đều là TAKEN
  MISSED = 'MISSED',     // Ít nhất một liều là MISSED hoặc SKIPPED, hoặc đã quá hạn
}