// src/components/common/SegmentedControl.tsx (Phiên bản MoMo)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, SIZES } from '@/constants/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onOptionPress: (index: number) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selectedIndex, onOptionPress }) => {
  const { width } = useWindowDimensions();
  // Tính toán chiều rộng của mỗi segment
  const segmentWidth = (width) / options.length;

  // Animation cho thanh trượt chính
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(selectedIndex * segmentWidth, { duration: 300, easing: Easing.out(Easing.quad) }) }],
    };
  });

  // Animation cho "miếng vá" góc
  const animatedCornerFakerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(selectedIndex * segmentWidth, { duration: 300, easing: Easing.out(Easing.quad) }) }],
    };
  });

  return (
    <View style={styles.container}>
      {/* "Miếng vá" để tạo hiệu ứng liền mạch */}
      <Animated.View style={[styles.cornerFaker, { width: segmentWidth }, animatedCornerFakerStyle]} />

      {/* Thanh trượt chính có thể nhìn thấy */}
      <Animated.View style={[styles.activeIndicator, selectedIndex === 0 ? { borderTopRightRadius: 20 } : { borderTopLeftRadius: 20 } , { width: segmentWidth }, animatedIndicatorStyle]} />

      {/* Các nút bấm */}
      {options.map((option, index) => {
        const isActive = selectedIndex === index;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.option]}
            onPress={() => onOptionPress(index)}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight, // Nền trong suốt
    position: 'relative',
    height: 50, // Chiều cao cố định
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  activeIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: COLORS.white,
    zIndex: 1, // Nằm trên "miếng vá"
  },
  cornerFaker: {
    position: 'absolute',
    // Đặt nó cao hơn một chút để che đi phần bo tròn của container bên dưới
    height: '150%', 
    backgroundColor: COLORS.white, // Cùng màu với nền nội dung
    zIndex: 0, // Nằm dưới thanh trượt
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Nằm trên cùng
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  optionTextActive: {
    color: COLORS.primary, // Hoặc màu bạn muốn cho text active
  },
});

export default SegmentedControl;