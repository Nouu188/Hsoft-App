import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ViewabilityConfig, 
  ViewToken 
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '@/constants/theme';

// --- Hằng số ---
const { width: screenWidth } = Dimensions.get('window');

// --- Định nghĩa Props (Không thay đổi) ---
interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  autoplay?: boolean;
  autoplayInterval?: number;
  showControls?: boolean;
  showPagination?: boolean;
}

// --- Component ---
const Carousel = <T extends { id: string | number }>({
  data,
  renderItem,
  autoplay = true,
  autoplayInterval = 5000,
  showControls = true,
  showPagination = true,
}: CarouselProps<T>) => {
  // --- State & Refs ---
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<T>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Logic điều hướng ---
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

  // --- Logic tự động cuộn ---
  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay(); // Đảm bảo không có interval nào đang chạy
    if (autoplay) {
      intervalRef.current = setInterval(handleNext, autoplayInterval);
    }
  }, [autoplay, autoplayInterval, handleNext, stopAutoplay]);

  // --- Effect chính để quản lý vòng đời autoplay ---
  useEffect(() => {
    if (data.length > 0) {
      startAutoplay();
    }
    // Dọn dẹp interval khi component bị hủy
    return () => stopAutoplay();
  }, [startAutoplay, data.length]);

  // --- Callbacks cho FlatList ---
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

  // --- Cấu hình cho FlatList (memoized) ---
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
  }).current;
  
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), []);


  // --- Render ---
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {renderItem(item)}
          </View>
        )}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      />
      {/* Chỉ báo trang (Pagination) */}
      {showPagination && data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { opacity: index === activeIndex ? 1 : 0.3 },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
  },
  itemContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none', 
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: COLORS.primary, // Dùng một màu và thay đổi độ mờ
  },
});

export default Carousel;