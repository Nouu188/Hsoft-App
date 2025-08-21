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
}

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