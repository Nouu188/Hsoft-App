import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { useUIStore } from '@/store/useUIStore';

const { width } = Dimensions.get('window');

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Schedule: { active: 'ellipse', inactive: 'ellipse-outline' },
  BookingWizard: { active: 'clipboard', inactive: 'clipboard-outline' },
  ProfileStack: { active: 'person', inactive: 'person-outline' },
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const isBottomSheetVisible = useUIStore(state => state.isBottomSheetVisible);

  // Lấy tên route hiện tại để ẩn TabBar khi cần
  const currentRouteName = state.routes[state.index].name;
  const isTabBarHidden = currentRouteName === 'BookingWizard' || isBottomSheetVisible;

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(isTabBarHidden ? 100 : 0, { duration: 250, easing: Easing.out(Easing.quad) }) },
    ],
    opacity: withTiming(isTabBarHidden ? 0 : 1, { duration: 200 }),
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedWrapperStyle]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { name } = route;

          const iconName = TAB_ICONS[name]?.[isFocused ? 'active' : 'inactive'] || 'ellipse-outline';

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

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.activeIconContainer]}
            >
              <Ionicons name={iconName as any} size={24} color={isFocused ? COLORS.white : COLORS.textLight} />
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
    width,
    alignItems: 'center',
    zIndex: 10,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
  },
});

export default CustomTabBar;
