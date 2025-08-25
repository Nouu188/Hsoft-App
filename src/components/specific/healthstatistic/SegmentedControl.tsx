import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { COLORS, SIZES } from '@/constants/theme'; // Đảm bảo đường dẫn đúng

interface SegmentedControlProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedOption,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.button}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.text,
              selectedOption === option ? styles.textActive : styles.textInactive,
            ]}
          >
            {option}
          </Text>
          {selectedOption === option && (
            <Animated.View
              style={styles.activeIndicator}
              layout={LinearTransition.duration(300)}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF', // Màu xanh nhạt hơn, tương tự COLORS.primaryLight
    borderRadius: SIZES.radius * 2,
    marginVertical: SIZES.padding,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.padding * 0.75,
  },
  text: {
    fontSize: SIZES.body3,
    fontWeight: '500',
  },
  textActive: {
    color: '#3B82F6', // Màu xanh dương, tương tự COLORS.introduction
    fontWeight: 'bold',
  },
  textInactive: {
    color: '#64748B', // Màu xám, tương tự COLORS.textLight
    opacity: 0.8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    backgroundColor: '#3B82F6', // Màu xanh dương
    borderRadius: 2,
  },
});

export default SegmentedControl;