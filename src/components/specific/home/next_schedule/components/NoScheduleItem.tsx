import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

const NoScheduleItem: React.FC = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.noScheduleText}>🎉 Tuyệt vời! Không có lịch trình nào sắp tới.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.8,
    ...SHADOWS.light,
  },
  noScheduleText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});

export default NoScheduleItem;