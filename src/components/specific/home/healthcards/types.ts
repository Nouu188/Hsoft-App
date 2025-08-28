import { ComponentProps } from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface Stat {
  key: string;
  title: string;
  icon: {
    name: IoniconName;
    color: string;
    bg: string;
  };
  getValue: (p: HealthStatsProps) => string;
  progress?: (p: HealthStatsProps) => number;
  // thêm để rõ ràng hơn
  dataKeys?: (keyof HealthStatsProps)[];
  
}
// Props cho GoalInputModal
export interface GoalInputModalProps {
  visible: boolean;
  pendingStat: Stat | null;
  goalValue: string;
  setGoalValue: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}
export type GridLayoutProps = {
  stats: Stat[];                  // Danh sách các stat hiện tại (hiển thị trên grid)
  initialStats: Stat[];           // Các stat mặc định (không thể xoá)
  healthProps: HealthStatsProps;  // Dữ liệu sức khoẻ cần truyền xuống các card
  onAdd: () => void;              // Hàm gọi khi bấm nút thêm stat
  onDelete: (key: string) => void;// Hàm gọi khi xoá một stat
};
export type InitialLayoutProps = {
  initialStats: Stat[];            // Danh sách các stat mặc định
  healthProps: HealthStatsProps;   // Dữ liệu sức khoẻ
  onAdd: () => void;               // Hàm xử lý khi bấm nút thêm
};
// Props cho StatCard
export type StatCardComponentProps = StatCardProps & {
  onDelete?: (key: string) => void;
};
export interface StatPickerModalProps {
  visible: boolean;
  availableStats: Stat[];
  onSelect: (stat: Stat) => void;
  onClose: () => void;
}
export interface AddStatModalProps {
  onPress: () => void;
}

export interface HealthStatsProps {
  heartRate: number;
  steps: number;
  stepsGoal: number;

  // thêm các props cho card mở rộng
  sleep?: number;
  sleepGoal?: number;

  calories?: number;
  caloriesGoal?: number;

  water?: number;
  waterGoal?: number;

  [key: string]: number | undefined;
}

export interface StatCardProps {
  stat: Stat;
  healthProps: HealthStatsProps;
  large?: boolean;
}
