// Props cho component Carousel (NewsCarouselView)
export interface CarouselProps<T> {
  data: T[];                                // Mảng dữ liệu (danh sách item trong carousel)
  renderItem: (item: T) => React.ReactElement; 
  // Hàm nhận vào 1 item và trả về UI hiển thị cho slide đó

  autoplay?: boolean;                       // (optional) Bật/tắt chế độ tự động cuộn
  autoplayInterval?: number;                // (optional) Thời gian chờ giữa mỗi lần cuộn (ms)
  showPagination?: boolean;                 // (optional) Hiển thị chấm (dots) phân trang hay không
}

// Props cho component Pagination (dãy chấm ở dưới carousel)
export interface PaginationProps {
  dataLength: number;                       // Tổng số lượng item (số chấm cần hiển thị)
  activeIndex: number;                      // Chỉ số của item đang active (chấm sáng)
}

// Props cho custom hook useCarousel (nội bộ logic)
export interface UseCarouselProps<T> {
  data: T[];                                // Mảng dữ liệu hiển thị trong carousel
  autoplay: boolean;                        // Có bật chế độ tự động cuộn hay không
  autoplayInterval: number;                 // Khoảng thời gian giữa các lần cuộn (ms)
}
