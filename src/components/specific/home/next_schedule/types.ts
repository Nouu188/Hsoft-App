import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

/**
 * Định nghĩa props cho component hiển thị một lịch trình cụ thể.
 * @interface NextScheduleItemProps
 */
export interface NextScheduleItemProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}