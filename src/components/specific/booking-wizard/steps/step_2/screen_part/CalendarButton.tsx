import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { COLORS, SIZES } from '@/constants/theme';

dayjs.locale('vi');

interface CalendarButtonProps {
  onPress: () => void;
  selectedDate: string; // YYYY-MM-DD
}

const CalendarButton: React.FC<CalendarButtonProps> = ({ onPress, selectedDate }) => {
  const date = dayjs(selectedDate);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons name="calendar-outline" size={26} color={COLORS.primary} />
      <View style={styles.dateContainer}>
        <Text style={styles.dayText}>{date.format('DD')}</Text>
        <Text style={styles.monthText}>{date.format('MMM')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateContainer: {
    marginLeft: SIZES.padding / 1.5,
    alignItems: 'flex-start',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    lineHeight: 18, // Giảm khoảng cách dòng
  },
  monthText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'capitalize', // Viết hoa chữ đầu
    lineHeight: 15, // Giảm khoảng cách dòng
  },
});

export default CalendarButton;
