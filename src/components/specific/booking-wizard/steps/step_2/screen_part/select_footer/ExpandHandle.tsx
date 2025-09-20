import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '@/constants/theme';

interface ExpandHandleProps {
  isExpanded: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const ExpandHandle: React.FC<ExpandHandleProps> = ({ isExpanded, onPress, style }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [floatAnim]);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.handleArea, style]}>
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-up'} // expand thì mũi tên lên
          size={20}
          color={COLORS.placeHolderIcon}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  handleArea: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExpandHandle;
