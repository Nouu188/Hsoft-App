import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES, COLORS } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subTitle?: React.ReactNode;
  expanded: boolean;
  disabled: boolean;
  onPress: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subTitle,
  expanded,
  disabled,
  onPress,
}) => {
  const rotateAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.header}
      disabled={disabled}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, disabled && styles.textDisabled]}>{title}</Text>
        {subTitle && <Text style={[styles.subTitle, disabled && styles.textDisabled]}>{subTitle}</Text>}
      </View>
      <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
        <Ionicons
          name="chevron-down-outline"
          size={24}
          color={disabled ? COLORS.textLight : COLORS.textDark}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  textDisabled: {
    color: COLORS.textLight,
  },
});

export default SectionHeader;
