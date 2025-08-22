// src/hooks/useMorphingAnimation.ts
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

// Định nghĩa cấu hình cho nút FAB để hook có thể tái sử dụng
interface FabConfig {
  size: number;
  bottom: number;
  right: number;
}

// Định nghĩa kiểu dữ liệu trả về của hook để code dễ đọc và an toàn hơn
interface MorphingHookResult {
  isExpanded: boolean;
  animationProgress: SharedValue<number>;
  handleToggleNoteView: () => void;
  morphingStyle: ReturnType<typeof useAnimatedStyle>;
  iconStyle: ReturnType<typeof useAnimatedStyle>;
}

export const useMorphingAnimation = (config: FabConfig): MorphingHookResult => {
  const { size, bottom, right } = config;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const animationProgress = useSharedValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Dùng ref để quản lý và xóa timers, tránh memory leak
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleNoteView = () => {
    const opening = !isExpanded;

    // Xóa các timer cũ để tránh các hành vi không mong muốn khi người dùng nhấn liên tục
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    if (opening) {
      // Bắt đầu animation trước
      animationProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      // Mount component con sau một khoảng trễ ngắn để animation mở được mượt mà
      openTimerRef.current = setTimeout(() => setIsExpanded(true), 120);
    } else {
      // Bắt đầu animation đóng
      animationProgress.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      // Unmount component con sau khi animation đã kết thúc
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
      backgroundColor: '#FFFFFF', // Giả sử màu trắng
      transform: [{ translateX }, { translateY }],
      elevation: interpolate(animationProgress.value, [0, 1], [5, 0]),
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 0.2], [1, 0]),
  }));

  // Trả về tất cả các giá trị và hàm mà component cần sử dụng
  return {
    isExpanded,
    animationProgress,
    handleToggleNoteView,
    morphingStyle,
    iconStyle,
  };
};