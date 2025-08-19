// src/screens/HealthStatsScreen/types.ts

import { ComponentProps } from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Định nghĩa cho một thẻ chỉ số
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
}

// Định nghĩa cho các props dữ liệu sức khỏe
export interface HealthStatsProps {
  heartRate: number;
  steps: number;
  stepsGoal: number;
}

export interface StatCardProps {
  stat: Stat;
  healthProps: HealthStatsProps;
  large?: boolean;
}