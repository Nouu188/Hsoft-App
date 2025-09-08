import { COLORS, DARK_COLORS } from '@/constants/theme';
import { useState, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

// Cấu hình FAB
interface FabConfig {
  size: number;
  bottom: number;
  right: number;
  isDarkMode: boolean; // bắt buộc phải truyền isDarkMode
}

// Kiểu dữ liệu trả về của hook
interface MorphingHookResult {
  isExpanded: boolean;
  animationProgress: SharedValue<number>;
  handleToggleNoteView: () => void;
  morphingStyle: ReturnType<typeof useAnimatedStyle>;
  iconStyle: ReturnType<typeof useAnimatedStyle>;
}

export const useMorphingAnimation = (config: FabConfig): MorphingHookResult => {
  const { size, bottom, right, isDarkMode } = config;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const animationProgress = useSharedValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleNoteView = () => {
    const opening = !isExpanded;

    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    if (opening) {
      animationProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      openTimerRef.current = setTimeout(() => setIsExpanded(true), 120);
    } else {
      animationProgress.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      closeTimerRef.current = setTimeout(() => setIsExpanded(false), 420);
    }
  };

  const morphingStyle = useAnimatedStyle(() => {
    const width = interpolate(animationProgress.value, [0, 1], [size, screenWidth]);
    const height = interpolate(animationProgress.value, [0, 1], [size, screenHeight]);
    const borderRadius = interpolate(animationProgress.value, [0, 1], [size / 2, 0]);
    const translateX = interpolate(animationProgress.value, [0, 1], [0, -(screenWidth - size - right)]);
    const translateY = interpolate(animationProgress.value, [0, 1], [0, -(screenHeight - size - bottom)]);

    return {
      width,
      height,
      borderRadius,
      backgroundColor: isDarkMode ? DARK_COLORS.white : COLORS.primary, 
      transform: [{ translateX }, { translateY }],
      elevation: interpolate(animationProgress.value, [0, 1], [5, 0]),
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 0.2], [1, 0]),
  }));

  return {
    isExpanded,
    animationProgress,
    handleToggleNoteView,
    morphingStyle,
    iconStyle,
  };
};
