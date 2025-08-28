import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBarProps } from './types'; // import type đã tách

// Component ProgressBar hiển thị thanh tiến độ dạng ngang
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,            // % tiến độ (0 - 100)
  color = '#60A5FA',   // màu thanh fill
  backgroundColor = '#EFF6FF', // màu nền thanh
}) => (
  <View
    style={[styles.progressBarContainer, { backgroundColor }]} // Container nền
  >
    {/* Thanh fill tiến độ */}
    <View
      style={[
        styles.progressBarFill,
        { width: `${progress}%`, backgroundColor: color }, // chiều rộng theo %
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  progressBarContainer: {
    height: 8,        // chiều cao thanh
    borderRadius: 4,  // bo góc
    width: '100%',    // chiếm toàn bộ chiều ngang của container cha
  },
  progressBarFill: {
    height: '100%',   // chiều cao bằng container
    borderRadius: 4,  // bo góc giống container
  },
});

export default ProgressBar;
