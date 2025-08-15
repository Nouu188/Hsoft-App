import React, { useCallback, useRef, useMemo } from 'react';
import { Dimensions, StyleSheet, View, FlatList, TouchableOpacity, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedReaction,
  runOnJS,
  interpolate,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { AppointmentCardData } from '@/constants/mockData';
import CarouselItem from './CarouselItem';
import ParallaxCarouselPagination from './Pagination';
import { COLORS, SIZES } from '@/constants/theme';
import ViewMoreCard from './ViewMoreCard';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const ITEM_SPACING = 20;

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

  // Animated scroll handler với throttling tối ưu
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const newIndex = Math.round(event.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
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

  // Tối ưu scroll to index với animation mượt
  const scrollToIndex = useCallback((index: number) => {
    if (index < 0 || index >= totalItems) return;
    
    const toValue = index * (ITEM_WIDTH + ITEM_SPACING);
    scrollX.value = withSpring(toValue, {
      damping: 20,
      stiffness: 90,
      mass: 0.8
    });
    
    flatListRef.current?.scrollToOffset({
      offset: toValue,
      animated: true,
    });
  }, [totalItems, scrollX]);

  // Navigation handlers với debounce
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

  // Animated styles cho navigation buttons
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

  // Optimized render item với useCallback
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item.id === 'view-more') {
        return (
          <View style={[styles.itemContainer]}>
            <ViewMoreCard 
              onPress={onViewAllPress}
              scrollX={scrollX}
              index={index}
            />
          </View>
        );
      }
      return (
        <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
          <CarouselItem
            item={item}
            index={index}
            scrollX={scrollX}
            total={data.length}
          />
        </View>
      );
    },
    [scrollX, data.length, onViewAllPress]
  );

  // Optimized getItemLayout cho performance tốt hơn
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH + ITEM_SPACING,
      offset: (ITEM_WIDTH + ITEM_SPACING) * index,
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
      {/* Navigation Buttons với animated styles */}
      <Animated.View style={[styles.navButton, styles.prevButton, prevButtonStyle]}>
        <TouchableOpacity 
          onPress={handlePrev}
          style={styles.buttonTouchable}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.navButton, styles.nextButton, nextButtonStyle]}>
        <TouchableOpacity 
          onPress={handleNext}
          style={styles.buttonTouchable}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Optimized Carousel */}
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
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        snapToAlignment="start"
        bounces={false}
        bouncesZoom={false}
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        contentContainerStyle={styles.flatListContainer}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / (ITEM_WIDTH + ITEM_SPACING));
          if (index !== activeIndex.value) {
            activeIndex.value = index;
          }
        }}
      />

      {/* Pagination và View All */}
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
    paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 3,
  },
  itemContainer: {
    marginHorizontal: ITEM_SPACING / 3,
  },
  navButton: {
    position: 'absolute',
    top: '40%',
    transform: [{ translateY: -20 }],
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
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});