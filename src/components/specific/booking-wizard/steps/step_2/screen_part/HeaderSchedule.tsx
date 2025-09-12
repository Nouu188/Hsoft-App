import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface HeaderSectionProps {
  scheduleType: 'doctor' | 'clinic';
}

const HeaderSchedule: React.FC<HeaderSectionProps> = ({ scheduleType }) => (
  <View style={styles.header}>
    <Text style={styles.title}>Chọn lịch khám</Text>
    <Text style={styles.subTitle}>
      {scheduleType === 'doctor'
        ? 'Chọn bác sĩ bạn muốn khám.'
        : 'Chọn phòng khám bạn muốn đến.'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  header: { paddingHorizontal: SIZES.padding, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  subTitle: { fontSize: 14, color: COLORS.text, marginTop: 4 },
});

export default HeaderSchedule;
