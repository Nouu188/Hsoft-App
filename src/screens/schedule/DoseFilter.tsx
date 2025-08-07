import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import React from 'react';

export interface FilterState {
  status: 'ALL' | 'ACTION_NEEDED' | 'COMPLETED' | 'UPCOMING';
  timeOfDay: ('Sáng' | 'Trưa' | 'Chiều' | 'Tối')[];
}

interface DoseFilterProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

const STATUS_FILTERS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Cần uống', value: 'ACTION_NEEDED' },
  { label: 'Đã xong', value: 'COMPLETED' },
  { label: 'Sắp tới', value: 'UPCOMING' },
];

const TIME_FILTERS: ('Sáng' | 'Trưa' | 'Chiều' | 'Tối')[] = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

const DoseFilter: React.FC<DoseFilterProps> = ({ filters, onFilterChange }) => {
  
  const handleStatusChange = (status: FilterState['status']) => {
    onFilterChange({ ...filters, status });
  };

  const handleTimeOfDayToggle = (time: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối') => {
    const newTimes = filters.timeOfDay.includes(time)
      ? filters.timeOfDay.filter(t => t !== time)
      : [...filters.timeOfDay, time];
    onFilterChange({ ...filters, timeOfDay: newTimes });
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {STATUS_FILTERS.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[styles.chip, filters.status === item.value && styles.chipActive]}
            onPress={() => handleStatusChange(item.value as FilterState['status'])}
          >
            <Text style={[styles.chipText, filters.status === item.value && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {TIME_FILTERS.map(time => (
          <TouchableOpacity
            key={time}
            style={[styles.chip, filters.timeOfDay.includes(time) && styles.chipActive]}
            onPress={() => handleTimeOfDayToggle(time)}
          >
            <Text style={[styles.chipText, filters.timeOfDay.includes(time) && styles.chipTextActive]}>{time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.padding / 2,
  },
  scrollContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 5,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.textDark,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
  },
});

export default DoseFilter;