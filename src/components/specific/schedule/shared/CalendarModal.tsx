// src/components/shared/CalendarModal.tsx

import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS, SIZES } from '@/constants/theme';
import dayjs from 'dayjs';

// Cấu hình ngôn ngữ cho react-native-calendars
LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  monthNamesShort: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
  dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: "Hôm nay"
};
LocaleConfig.defaultLocale = 'vi';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDayPress: (dateString: string) => void;
  currentDate: string; // YYYY-MM-DD
}

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose, onDayPress, currentDate }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Calendar
                current={currentDate}
                onDayPress={(day) => {
                  onDayPress(day.dateString);
                  onClose();
                }}
                monthFormat={'MMMM, yyyy'}
                theme={{
                  backgroundColor: COLORS.white,
                  calendarBackground: COLORS.white,
                  textSectionTitleColor: COLORS.textLight,
                  selectedDayBackgroundColor: COLORS.primary,
                  selectedDayTextColor: COLORS.white,
                  todayTextColor: COLORS.primary,
                  dayTextColor: COLORS.textDark,
                  textDisabledColor: '#d9e1e8',
                  dotColor: COLORS.primary,
                  selectedDotColor: COLORS.white,
                  arrowColor: COLORS.primary,
                  monthTextColor: COLORS.textDark,
                  indicatorColor: COLORS.primary,
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

export default CalendarModal;