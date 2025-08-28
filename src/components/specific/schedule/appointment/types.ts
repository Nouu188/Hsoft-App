import { AppointmentCardData } from '@/constants/mockData';
import { SharedValue } from 'react-native-reanimated';

export interface CarouselItemProps {
  scrollX: SharedValue<number>;
  index: number;
  total: number;
  item: AppointmentCardData;
}
// Props cho từng dot của pagination
export interface PaginationDotProps {
  index: number;                  // Vị trí dot trong pagination
  scrollX: SharedValue<number>;   // Giá trị scroll của carousel
}

// Props cho toàn bộ component pagination
export interface ParallaxCarouselPaginationProps {
  data: AppointmentCardData[];    // Mảng dữ liệu của carousel
  scrollX: SharedValue<number>;   // Giá trị scroll của carousel
}