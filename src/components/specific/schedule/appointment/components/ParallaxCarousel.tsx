import React from 'react';
import { Dimensions, StyleSheet, View, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, withTiming, Easing } from 'react-native-reanimated';
import { AppointmentCardData } from '@/constants/mockData';
import CarouselItem from './CarouselItem';
import ParallaxCarouselPagination from './Pagination';
import { SIZES } from '@/constants/theme';

const OFFSET = 45;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface ParallaxCarouselProps {
  data: AppointmentCardData[];
}

const ParallaxCarousel: React.FC<ParallaxCarouselProps> = ({ data }) => {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = withTiming(event.contentOffset.x, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    },
  });

  return (
    <View style={[styles.container]}>
      <AnimatedScrollView
        horizontal
        decelerationRate={'fast'}
        snapToInterval={ITEM_WIDTH}
        showsHorizontalScrollIndicator={false}
        disableIntervalMomentum
        bounces={false}
        onScroll={scrollHandler}
        contentContainerStyle={{ alignItems: 'center' }}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <CarouselItem
            key={item.id}
            item={item}
            index={index}
            scrollX={scrollX}
            total={data.length}
          />
        ))}
      </AnimatedScrollView>
      <ParallaxCarouselPagination data={data} scrollX={scrollX} />
    </View>
  );
};

export default ParallaxCarousel;

const styles = StyleSheet.create({
  container: {

  },
});