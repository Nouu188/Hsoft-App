import { useState, useRef, useCallback, useEffect } from 'react';
import { FlatList, ViewabilityConfig, ViewToken } from 'react-native';

// Props cho custom hook
interface UseCarouselProps<T> {
  data: T[];
  autoplay: boolean;
  autoplayInterval: number;
}

export const useCarousel = <T extends { id: string | number }>({
  data,
  autoplay,
  autoplayInterval,
}: UseCarouselProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<T>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Logic điều hướng
  const handleNext = useCallback(() => {
    if (data.length === 0) return;
    const nextIndex = activeIndex === data.length - 1 ? 0 : activeIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, [activeIndex, data.length]);

  const handlePrev = useCallback(() => {
    if (data.length === 0) return;
    const prevIndex = activeIndex === 0 ? data.length - 1 : activeIndex - 1;
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
  }, [activeIndex, data.length]);

  // Logic tự động cuộn
  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (autoplay && data.length > 1) {
      intervalRef.current = setInterval(handleNext, autoplayInterval);
    }
  }, [autoplay, autoplayInterval, data.length, handleNext, stopAutoplay]);

  // Effect quản lý vòng đời autoplay
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay]);

  // Callbacks cho FlatList
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleScrollBeginDrag = useCallback(() => {
    stopAutoplay();
  }, [stopAutoplay]);

  const handleScrollEndDrag = useCallback(() => {
    startAutoplay();
  }, [startAutoplay]);
  
  // Trả về tất cả state và functions cần thiết cho component UI
  return {
    activeIndex,
    flatListRef,
    handleNext,
    handlePrev,
    onViewableItemsChanged,
    handleScrollBeginDrag,
    handleScrollEndDrag,
  };
};