import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useRelativeDate } from "@/hooks/useRelativeDate";
import Ionicons from "@react-native-vector-icons/ionicons";
import CalendarModal from "./CalendarModal";

dayjs.locale('vi'); 

const DateSelector: React.FC = () => {
  const selectedDate = useScheduleStore(state => state.selectedDate);
  const setSelectedDate = useScheduleStore(state => state.setSelectedDate);

  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const relativeDateString = useRelativeDate(selectedDate);

  const dates = useMemo(() => {
    const startPoint = selectedDate.subtract(3, 'day');
    return Array.from({ length: 7 }).map((_, i) => startPoint.add(i, 'day'));
  }, [selectedDate]);

  const monthYearString = useMemo(() => {
    const formattedString = selectedDate.format('MMMM, YYYY');
    return formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
  }, [selectedDate]);

  const handleDayPress = (dateString: string) => {
    setSelectedDate(dayjs(dateString));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.relativeDateText}>{relativeDateString}</Text>
          <TouchableOpacity style={styles.calendarIcon} onPress={() => setCalendarVisible(true)}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
        <Text style={styles.monthText}>{monthYearString}</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.dateSelectorContainer}
      >
        {dates.map((date, index) => {
          const isActive = date.isSame(selectedDate, 'day');
          return (
            <TouchableOpacity
              key={index} 
              style={styles.dateButton}
              onPress={() => setSelectedDate(date)}
            >
              <View style={[styles.dateNumberContainer, isActive && styles.dateButtonActive]}>
                {isActive && <View style={styles.dot} />}
                <Text style={[styles.dateNumber, isActive && styles.dateNumberActive]}>{date.format('D')}</Text>
              </View>
              <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>{date.format('ddd')}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDayPress={handleDayPress}
        currentDate={selectedDate.format('YYYY-MM-DD')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding / 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  calendarIcon: {
    marginLeft: 6,
    padding: 4,
    color: COLORS.textLight,
  },
  relativeDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  dateSelectorContainer: { 
    paddingHorizontal: SIZES.padding, 
    paddingBottom: SIZES.padding * 0.2,
    alignItems: 'center',
  },
  dateButton: { 
    borderRadius: 25, 
    paddingBottom: 10, 
    paddingHorizontal: 3, 
    marginRight: 10, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    minWidth: 54, 
    minHeight: 58, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    backgroundColor: COLORS.white,
  },
  dateNumberContainer: {
    marginTop: 6,
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    minWidth: 38, 
    alignItems: 'center',
    borderRadius: 100,
  },
  dateButtonActive: { 
    backgroundColor: COLORS.primaryLight, 
    borderColor: COLORS.primary, 
  },
  dot: { 
    position: 'absolute', 
    top: -2, 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: COLORS.primary 
  },
  dateNumber: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.textDark, 
  },
  dateNumberActive: {
    // Có thể thêm style cho số khi active nếu muốn
  },
  dateDay: { 
    fontSize: 12, 
    color: COLORS.textLight,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  dateDayActive: {
    fontWeight: 'bold',
  }
});

export default DateSelector;