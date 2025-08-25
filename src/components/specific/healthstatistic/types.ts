// Định nghĩa cấu trúc dữ liệu cho toàn bộ màn hình
export type DailyProgress = { taken: number; total: number; };
export type Medication = { name: string; frequency: string; taken: number; total: number; color: string; progressColor: string; iconColor: string; };
export type Statistic = { value: string; label: string; hasIcon: boolean; };

// Định nghĩa props cho các component con
export type CircularProgressProps = { value: number; total: number; size?: number; strokeWidth?: number; };
export type ProgressBarProps = { progress: number; color?: string; backgroundColor?: string; };
export type MedicationCardProps = { medication: Medication; };
export type StatCardProps = { stat: Statistic; };