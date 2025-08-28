import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgressProps } from './types'; // import type đã định nghĩa

// Component CircularProgress hiển thị tiến độ dạng hình tròn
const CircularProgress: React.FC<CircularProgressProps> = ({
  value,         // số lượng hiện tại
  total,         // tổng số
  size = 160,    // đường kính vòng tròn (mặc định 160)
  strokeWidth = 12, // độ dày vòng tròn (mặc định 12)
}) => {
  // Tính phần trăm tiến độ
  const percentage = (value / total) * 100;
  const radius = size / 2;

  // Tính vị trí translateY cho fill layer (càng cao = phần trăm càng nhiều)
  const fillTranslateY = size - (size * percentage) / 100;

  return (
    <View
      style={[
        styles.progressContainer,
        { width: size, height: size, borderRadius: radius, overflow: 'hidden' },
      ]}
    >
      {/* Layer nền */}
      <View style={[styles.progressLayer, { backgroundColor: '#EFF6FF' }]} />

      {/* Layer tiến độ (fill) */}
      <View
        style={[
          styles.progressLayer,
          {
            backgroundColor: '#60A5FA',
            transform: [{ translateY: fillTranslateY }], // fill từ dưới lên
          },
        ]}
      />

      {/* Vòng tròn bên trong hiển thị icon và số liệu */}
      <View
        style={[
          styles.progressInnerCircle,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: radius,
          },
        ]}
      >
        {/* Icon viên thuốc nằm giữa */}
        <View style={styles.pillIcon} />

        {/* Text hiển thị tiến độ */}
        <Text style={styles.progressText}>
          {value}/{total} viên
        </Text>
      </View>
    </View>
  );
};

// Style
const styles = StyleSheet.create({
  progressContainer: {
    alignSelf: 'center',        // căn giữa
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#EFF6FF', // nền chính
  },
  progressLayer: {
    position: 'absolute',       // chồng lên nhau
    width: '100%',
    height: '100%',
  },
  progressInnerCircle: {
    backgroundColor: '#F8FAFC', // vòng tròn nội dung
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pillIcon: {
    width: 20,
    height: 40,
    backgroundColor: '#93C5FD',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }], // xoay 45 độ cho dạng viên thuốc
    opacity: 0.8,
  },
  progressText: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
});

export default CircularProgress;
