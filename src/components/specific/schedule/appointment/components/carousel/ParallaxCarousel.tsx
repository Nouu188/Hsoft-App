import { AppointmentCardData } from '@/constants/mockData';
import { COLORS, SIZES } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { SCREEN_WIDTH, SNAP_INTERVAL } from '../../carouselConfig';
import CarouselItem from './CarouselItem';
import ParallaxCarouselPagination from './Pagination';
import ViewMoreCard from './ViewMoreCard';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface ParallaxCarouselProps {
  data: AppointmentCardData[];
  onViewAllPress: () => void;
}

const ParallaxCarousel: React.FC<ParallaxCarouselProps> = ({ data, onViewAllPress }) => {
  const scrollX = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useSharedValue(false);

  const carouselData = useMemo(() => [
    ...data,
    { id: 'view-more' } as const
  ], [data]);

  const totalItems = carouselData.length;

  // Animated scroll handler with corrected index calculation for centered alignment
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const center = event.contentOffset.x + SCREEN_WIDTH / 2;
      const adjusted = center - SNAP_INTERVAL / 2;
      const newIndex = Math.round(adjusted / SNAP_INTERVAL);
      if (newIndex !== activeIndex.value && newIndex >= 0 && newIndex < totalItems) {
        activeIndex.value = newIndex;
      }
    },
    onBeginDrag: () => {
      isScrolling.value = true;
    },
    onEndDrag: () => {
      isScrolling.value = false;
    }
  });

  // Optimized scroll to index using scrollToIndex with viewPosition for centering
  const scrollToIndex = useCallback((index: number) => {
    if (index < 0 || index >= totalItems) return;
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, [totalItems]);

  // Navigation handlers with debounce
  const handlePrev = useCallback(() => {
    if (isScrolling.value) return;
    const currentIndex = activeIndex.value;
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  }, [scrollToIndex, activeIndex, isScrolling]);

  const handleNext = useCallback(() => {
    if (isScrolling.value) return;
    const currentIndex = activeIndex.value;
    if (currentIndex < totalItems - 1) {
      scrollToIndex(currentIndex + 1);
    }
  }, [scrollToIndex, activeIndex, isScrolling, totalItems]);

  // Animated styles for navigation buttons
  const prevButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      activeIndex.value,
      [0, 1],
      [0.4, 0.85],
      'clamp'
    );
    return {
      opacity: withSpring(opacity)
    };
  });

  const nextButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      activeIndex.value,
      [totalItems - 2, totalItems - 1],
      [0.85, 0.4],
      'clamp'
    );
    return {
      opacity: withSpring(opacity)
    };
  });

  // Optimized render item with useCallback and slot for centering
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <View style={styles.itemSlot}>
          {item.id === 'view-more' ? (
            <ViewMoreCard
              onPress={onViewAllPress}
              scrollX={scrollX}
              index={index}
            />
          ) : (
            <CarouselItem
              item={item}
              index={index}
              scrollX={scrollX}
              total={data.length}
            />
          )}
        </View>
      );
    },
    [scrollX, data.length, onViewAllPress]
  );

  // Optimized getItemLayout for better performance with corrected length/offset
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SNAP_INTERVAL,
      offset: SNAP_INTERVAL * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => item.id || `item-${index}`,
    []
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.navButton, styles.prevButton, prevButtonStyle]}>
        <TouchableOpacity
          onPress={handlePrev}
          style={styles.buttonTouchable}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.navButton, styles.nextButton, nextButtonStyle]}>
        <TouchableOpacity
          onPress={handleNext}
          style={styles.buttonTouchable}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </Animated.View>

      <AnimatedFlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={carouselData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="normal"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        bounces={false}
        bouncesZoom={false}
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        contentContainerStyle={styles.flatListContainer}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const center = offsetX + SCREEN_WIDTH / 2;
          const adjusted = center - SNAP_INTERVAL / 2;
          const index = Math.round(adjusted / SNAP_INTERVAL);
          if (index !== activeIndex.value) {
            activeIndex.value = index;
          }
        }}
      />

      <View style={styles.paginationWrapper}>
        <View style={[styles.viewAllButton, styles.invisibleButton]}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </View>

        <View style={styles.paginationContainer}>
          <ParallaxCarouselPagination
            data={data}
            scrollX={scrollX}
          />
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllPress}
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ParallaxCarousel;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  flatListContainer: {
    // No padding needed with centered snap alignment
  },
  itemSlot: {
    width: SNAP_INTERVAL,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '40%',
    transform: [{ translateY: -0 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  prevButton: {
    left: 15,
  },
  nextButton: {
    right: 15,
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  paginationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  invisibleButton: {
    opacity: 0,
  },
  viewAllText: {
    color: COLORS.textDark,
    fontWeight: '600',
    fontSize: 14,
  },
});