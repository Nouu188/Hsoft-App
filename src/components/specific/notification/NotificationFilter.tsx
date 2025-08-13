// src/components/specific/notification/NotificationFilter.tsx
import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import { NotificationType } from '@/types';

const FILTERS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Nhắc thuốc', value: NotificationType.DOSE_REMINDER },
  { label: 'Kết quả', value: NotificationType.RESULT_AVAILABLE },
  { label: 'Lịch hẹn', value: NotificationType.APPOINTMENT_REMINDER },
  { label: 'Thanh toán', value: NotificationType.PAYMENT_DUE },
];

interface NotificationFilterProps {
  activeFilter: NotificationType | 'ALL';
  onFilterChange: (filter: NotificationType | 'ALL') => void;
}

const NotificationFilter: React.FC<NotificationFilterProps> = ({ activeFilter, onFilterChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
    {FILTERS.map(filter => {
      const isActive = activeFilter === filter.value;
      return (
        <TouchableOpacity
          key={filter.value}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => onFilterChange(filter.value as NotificationType | 'ALL')}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{filter.label}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { paddingVertical: SIZES.padding, paddingHorizontal: SIZES.padding,
    maxHeight:80
   },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.lightGray, marginRight: 10 },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textDark, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
});

export default NotificationFilter;