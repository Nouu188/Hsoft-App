import { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const useAuthForm = () => {
  const route = useRoute();
  const { initialView } = (route.params as { initialView?: string }) || {};
  const [isLoginView, setIsLoginView] = useState(initialView !== 'register');

  const formPosition = useSharedValue(initialView === 'register' ? -width : 0);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: formPosition.value }],
  }));

  const switchToLogin = () => {
    formPosition.value = withSpring(0, { damping: 35, stiffness: 150 });
    setIsLoginView(true);
  };

  const switchToRegister = () => {
    formPosition.value = withSpring(-width, { damping: 35, stiffness: 150 });
    setIsLoginView(false);
  };

  return {
    isLoginView,
    formAnimatedStyle,
    switchToLogin,
    switchToRegister,
  };
};
