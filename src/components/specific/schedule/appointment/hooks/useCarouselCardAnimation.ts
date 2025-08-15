import { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

export const useCarouselCardAnimation = (
  scrollX: SharedValue<number>,
  index: number,
  itemWidth: number
) => {
  const inputRange = [
    (index - 1) * itemWidth,
    index * itemWidth,
    (index + 1) * itemWidth,
  ];

  // Card animation
  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 0.92, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  // Content animation
  const contentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  // Icon animation
  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolation.CLAMP);
    const rotate = interpolate(scrollX.value, inputRange, [-5, 0, 5], Extrapolation.CLAMP);
    return {
      transform: [
        { scale },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(scrollX.value, inputRange, [-itemWidth * 0.02, 0, itemWidth * 0.02], Extrapolation.CLAMP);
    return { transform: [{ translateX }] };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [35, 0, 35], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return { cardStyle, contentStyle, iconStyle, textStyle, imageStyle };
};
