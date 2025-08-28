import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

// Dữ liệu của một lịch trình
export interface ScheduleData {
  id: string;       // ID duy nhất
  title: string;    // Tiêu đề
  subtitle: string; // Phụ đề/mô tả ngắn
}

// Props cho component hiển thị 1 item lịch trình
export interface NextScheduleItemProps {
  iconName: React.ComponentProps<typeof Ionicons>['name']; // Tên icon Ionicons
  iconBgColor: string;   // Màu nền của icon
  title: string;         // Tiêu đề
  subtitle: string;      // Phụ đề
  onPress: () => void;   // Hàm khi bấm vào item
}

// Props cho component hiển thị lịch trình kế tiếp
export interface NextScheduleViewProps {
  title: string;          // Tiêu đề section
  schedule: ScheduleData; // Dữ liệu lịch trình
  isLoading: boolean;     // Trạng thái đang tải
}
