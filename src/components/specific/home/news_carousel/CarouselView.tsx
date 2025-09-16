import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Pagination from './components/Pagination';
import { COLORS } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

// --- Kiểu base cho carousel item ---
export interface CarouselItemBase {
  id: string | number;
  url?: string;
  [key: string]: any;
}

// --- Props generic ---
interface CarouselProps<T extends CarouselItemBase> {
  data: T[];
  renderItem: (item: T, opacity?: Animated.Value) => React.ReactNode;
  autoplay?: boolean;
  autoplayInterval?: number;
  showPagination?: boolean;
  showArrows?: boolean;
  containerStyle?: object;
  itemHeight?: number;
  initialIndex?: number;
  loop?: boolean;
  arrowColor?: string;     
}

const NewsCarouselView = <T extends CarouselItemBase>({
  data,
  renderItem,
  autoplay = true,
  autoplayInterval = 4000,
  showPagination = true,
  showArrows = true,
  containerStyle,
  itemHeight = 240,
  initialIndex = 0,
  loop = true,
  arrowColor = COLORS.white,
}: CarouselProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // --- Chuyển slide với hiệu ứng fade ---
  const changeSlide = (nextIndex: number) => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setActiveIndex(nextIndex);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  const nextSlide = () => {
    if (activeIndex === data.length - 1 && !loop) return;
    changeSlide((activeIndex + 1) % data.length);
  };

  const prevSlide = () => {
    if (activeIndex === 0 && !loop) return;
    changeSlide((activeIndex - 1 + data.length) % data.length);
  };

  // --- Autoplay ---
  useEffect(() => {
    if (!autoplay || data.length <= 1) return;
    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [activeIndex, autoplay, autoplayInterval, data.length]);

  return (
    <View style={[{ height: itemHeight }, containerStyle]}>
      {data.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.itemContainer,
              { opacity: isActive ? opacityAnim : 0, height: itemHeight, width: '100%' },
            ]}
            pointerEvents={isActive ? 'auto' : 'none'}
          >
            {renderItem(item, opacityAnim)}
          </Animated.View>
        );
      })}

      {/* Pagination */}
      {showPagination && data.length > 1 && (
        <View style={styles.paginationContainer}>
          <Pagination dataLength={data.length} activeIndex={activeIndex} />
        </View>
      )}

      {/* Arrows */}
      {showArrows && data.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.carouselButton, styles.carouselButtonLeft, { backgroundColor: COLORS.transparent }]}
            onPress={prevSlide}
          >
            <Ionicons name="chevron-back" size={24} color={arrowColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.carouselButton, styles.carouselButtonRight, { backgroundColor: COLORS.transparent }]}
            onPress={nextSlide}
          >
            <Ionicons name="chevron-forward" size={24} color={arrowColor} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselButton: {
    position: 'absolute',
    top: '47%',
    zIndex: 10,
    borderRadius: 20,
    padding: 8,
    transform: [{ translateY: -12 }],
  },
  carouselButtonLeft: { left: 10 },
  carouselButtonRight: { right: 10 },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
});

export default NewsCarouselView;
