// src/components/common/SegmentedControl.tsx (Phiên bản MoMo)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { COLORS, SIZES } from '@/constants/theme';
import type { SegmentedControlProps } from './types';

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selectedIndex, onOptionPress }) => {
  const { width } = useWindowDimensions();

  const segmentWidth = (width) / options.length;

  const animatedX = useDerivedValue(() =>
    withTiming(selectedIndex * segmentWidth, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    })
  );

  const animatedRightRadius = useDerivedValue(() =>
    withTiming(selectedIndex === 0 ? 16 : 0, { duration: 300 })
  );

  const animatedLeftRadius = useDerivedValue(() =>
    withTiming(selectedIndex === options.length - 1 ? 16 : 0, { duration: 300 })
  );

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: animatedX.value }],
      borderTopLeftRadius: animatedLeftRadius.value,
      borderTopRightRadius: animatedRightRadius.value,
    };
  });

  return (
    <View style={styles.container}>
      <View>
        <Animated.View style={[styles.activeIndicator, styles.activeIndicatorShadow, selectedIndex === 0 ? { borderTopRightRadius: 16 } : { borderTopLeftRadius: 16 }, { width: segmentWidth }, animatedIndicatorStyle]} />
      </View>

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
    backgroundColor: COLORS.primaryLight,
    position: 'relative',
    height: 50,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  activeIndicatorShadow: {
    zIndex: 0,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 }, // width > 0 => bóng bên phải
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  activeIndicator: {
    bottom: 2,
    position: 'absolute',
    height: '100%',
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  optionTextActive: {
    color: COLORS.primary,
  },
});

export default SegmentedControl;