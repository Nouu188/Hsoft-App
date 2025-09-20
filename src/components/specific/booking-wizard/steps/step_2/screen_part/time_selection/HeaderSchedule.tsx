import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs'; // Thêm import dayjs
import { COLORS, SIZES } from '@/constants/theme';
import { useScheduleStore } from '@/store/useScheduleStore';
import CalendarButton from './CalendarButton';
import CalendarModal from './CalendarModal';

interface HeaderSectionProps {
  scheduleType: 'doctor' | 'clinic';
}

const HeaderSchedule: React.FC<HeaderSectionProps> = ({ scheduleType }) => {
  const { selectedDate, setSelectedDate } = useScheduleStore();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleDayPress = (day: any) => {
    // Chuyển đổi chuỗi ngày tháng (day.dateString) thành đối tượng dayjs
    // trước khi gửi vào store.
    setSelectedDate(dayjs(day.dateString));
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Chọn lịch khám</Text>
          <Text style={styles.subTitle}>
            {scheduleType === 'doctor'
              ? 'Chọn bác sĩ bạn muốn khám.'
              : 'Chọn phòng khám bạn muốn đến.'}
          </Text>
        </View>
        <CalendarButton
          selectedDate={dayjs(selectedDate).format('YYYY-MM-DD')}
          onPress={() => setModalVisible(true)}
        />
      </View>
      <CalendarModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onDayPress={handleDayPress}
        currentDate={dayjs(selectedDate).format('YYYY-MM-DD')}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1, // Cho phép text co giãn
    marginRight: SIZES.padding, // Khoảng cách với nút
  },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  subTitle: { fontSize: 14, color: COLORS.text, marginTop: 4 },
});

export default HeaderSchedule;
