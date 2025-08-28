// src/components/carousel/ParallaxCarouselPagination.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import type { PaginationDotProps, ParallaxCarouselPaginationProps } from '../../types';
import { Dimensions } from 'react-native';

const OFFSET = 45;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;

// Component từng dot
const PaginationDot: React.FC<PaginationDotProps> = ({ index, scrollX }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      scrollX.value,
      [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH],
      [10, 20, 10],
      Extrapolation.CLAMP,
    );

    const opacityAnimation = interpolate(
      scrollX.value,
      [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );

    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    };
  });

  const animatedColor = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollX.value,
      [0, ITEM_WIDTH, 2 * ITEM_WIDTH],
      ['#9095A7', '#9095A7', '#9095A7'],
    ),
  }));

  return <Animated.View style={[styles.dot, animatedDotStyle, animatedColor]} />;
};

// Component toàn bộ pagination
const ParallaxCarouselPagination: React.FC<ParallaxCarouselPaginationProps> = ({ data, scrollX }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <PaginationDot key={index} index={index} scrollX={scrollX} />
      ))}
    </View>
  );
};

export default ParallaxCarouselPagination;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'center',
  },
  dot: {
    height: 10,
    marginHorizontal: 8,
    borderRadius: 5,
  },
});
