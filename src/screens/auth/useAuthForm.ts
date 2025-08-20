import { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Custom hook để quản lý state và animation cho form xác thực.
 * Bao gồm logic chuyển đổi giữa giao diện Đăng nhập và Đăng ký.
 */
export const useAuthForm = () => {
  // Lấy tham số initialView từ route để xác định tab mặc định
  const route = useRoute();
  const { initialView } = (route.params as { initialView?: string }) || {};

  // State để xác định tab nào đang active
  const [isLoginView, setIsLoginView] = useState(initialView !== 'register');

  // Giá trị của Reanimated để điều khiển vị trí của form
  const formPosition = useSharedValue(initialView === 'register' ? -width : 0);

  // Style được tính toán dựa trên giá trị của formPosition
  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: formPosition.value }],
  }));

  // Hàm để chuyển sang giao diện Đăng nhập
  const switchToLogin = () => {
    formPosition.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    setIsLoginView(true);
  };

  // Hàm để chuyển sang giao diện Đăng ký
  const switchToRegister = () => {
    formPosition.value = withTiming(-width, { duration: 300, easing: Easing.out(Easing.quad) });
    setIsLoginView(false);
  };

  // Trả về tất cả các giá trị và hàm mà component cần dùng
  return {
    isLoginView,
    formAnimatedStyle,
    switchToLogin,
    switchToRegister,
  };
};