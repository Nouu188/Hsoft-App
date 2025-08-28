import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ViewToken } from 'react-native';
import type {UseCarouselProps} from '../types'
// Custom hook cho carousel
export const useCarousel = <T extends { id: string | number }>({
  data,
  autoplay,
  autoplayInterval,
}: UseCarouselProps<T>) => {
  // Index hiện tại (slide đang active)
  const [activeIndex, setActiveIndex] = useState(0);

  // Ref để giữ tham chiếu tới FlatList -> cho phép scroll bằng code
  const flatListRef = useRef<FlatList<T>>(null);

  // Ref để giữ interval cho autoplay (setInterval/clearInterval)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== Logic điều hướng =====
  // Chuyển sang slide kế tiếp
  const handleNext = useCallback(() => {
    if (data.length === 0) return;
    // Nếu đang ở cuối danh sách thì quay lại 0
    const nextIndex = activeIndex === data.length - 1 ? 0 : activeIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, [activeIndex, data.length]);

  // Chuyển sang slide trước đó
  const handlePrev = useCallback(() => {
    if (data.length === 0) return;
    // Nếu đang ở slide đầu tiên thì quay lại slide cuối
    const prevIndex = activeIndex === 0 ? data.length - 1 : activeIndex - 1;
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
  }, [activeIndex, data.length]);

  // ===== Logic autoplay =====
  // Dừng autoplay
  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // hủy interval
      intervalRef.current = null;
    }
  }, []);

  // Bắt đầu autoplay
  const startAutoplay = useCallback(() => {
    stopAutoplay(); // đảm bảo clear interval cũ trước khi set mới
    if (autoplay && data.length > 1) {
      intervalRef.current = setInterval(handleNext, autoplayInterval);
    }
  }, [autoplay, autoplayInterval, data.length, handleNext, stopAutoplay]);

  // Khi component mount -> start autoplay, khi unmount -> stop autoplay
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay]);

  // ===== Callbacks cho FlatList =====
  // Cập nhật activeIndex khi người dùng scroll
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index); // lấy index của item đang hiển thị
      }
    }
  ).current;

  // Khi người dùng bắt đầu kéo (drag) -> dừng autoplay
  const handleScrollBeginDrag = useCallback(() => {
    stopAutoplay();
  }, [stopAutoplay]);

  // Khi người dùng thả kéo (drag end) -> bật lại autoplay
  const handleScrollEndDrag = useCallback(() => {
    startAutoplay();
  }, [startAutoplay]);
  
  // Trả về state + hàm điều khiển cho UI component sử dụng
  return {
    activeIndex,             // slide hiện tại
    flatListRef,             // tham chiếu tới FlatList
    handleNext,              // hàm đi tới slide kế
    handlePrev,              // hàm quay lại slide trước
    onViewableItemsChanged,  // callback cập nhật index khi scroll
    handleScrollBeginDrag,   // callback dừng autoplay khi user scroll
    handleScrollEndDrag,     // callback bật lại autoplay khi user thả scroll
  };
};