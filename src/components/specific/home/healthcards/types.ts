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
