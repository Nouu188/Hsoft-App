import { NotificationType,NotificationHistory } from '@/types';
import { StyleProp, TextStyle } from 'react-native';
// Props cho component NotificationFilter
export interface NotificationFilterProps {
  // Bộ lọc hiện tại (có thể là 1 loại thông báo cụ thể hoặc 'ALL' = tất cả)
  activeFilter: NotificationType | 'ALL';

  // Hàm gọi khi người dùng chọn filter mới
  onFilterChange: (filter: NotificationType | 'ALL') => void;
}
// Props cho component NotificationItem
export interface NotificationItemProps {
  item: NotificationHistory; // Thông tin chi tiết của thông báo
  onPress: () => void;       // Hàm xử lý khi người dùng bấm vào thông báo
}
// Props cho component Icon
export interface IconProps {
  name: string;               // Tên icon hoặc ký tự hiển thị
  style?: StyleProp<TextStyle>; // Style tuỳ chọn
}
