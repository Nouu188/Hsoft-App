import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

// Lấy kiểu dữ liệu chính xác cho tên icon
export type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Định nghĩa kiểu dữ liệu cho mỗi mục tiện ích
export interface UtilityItemProps {
  id: string;
  name: string;
  iconName: IoniconsName;
  iconColor?: string;
  onPress: () => void;
}

// Props cho component chính
export interface UtilityGridProps {
  title: string;
  services: UtilityItemProps[];
  numColumns?: number;
}