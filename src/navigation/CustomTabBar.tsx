import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/theme';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useUIStore } from '@/store/useUIStore';

const { width } = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  // Lắng nghe state từ store
  const isBottomSheetVisible = useUIStore(state => state.isBottomSheetVisible);

  // Tạo style động cho wrapper
  const animatedWrapperStyle = useAnimatedStyle(() => {
    return {
      // Trượt xuống dưới màn hình khi modal mở, trượt lên lại khi đóng
      transform: [
        {
          translateY: withTiming(isBottomSheetVisible ? 100 : 0, {
            duration: 250,
            easing: Easing.out(Easing.quad)
          })
        }
      ],
      // Mờ đi khi ẩn
      opacity: withTiming(isBottomSheetVisible ? 0 : 1, { duration: 200 }),
    };
  });
  return (
    <Animated.View style={[styles.wrapper, animatedWrapperStyle]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'ellipse-outline';

          switch (route.name) {
            case 'Home':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Schedule':
              iconName = isFocused ? 'ellipse' : 'ellipse-outline';
              break;
            case 'Record':
              iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'ProfileStack':
              iconName = isFocused ? 'person' : 'person-outline';
              break;
          }
          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.activeIconContainer]}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? COLORS.white : COLORS.textLight}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 25,
    width: width,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    width: 320,
    height: 60,
    borderRadius: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  tabItem: {
    width: 40,
    height: 40,
    borderRadius: 25, // Nửa chiều rộng/cao để luôn là hình tròn
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
  },
});

export default CustomTabBar;
