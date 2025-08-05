import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DateSelector: React.FC = () => {
  const selectedDate = useScheduleStore(state => state.selectedDate);
  const setSelectedDate = useScheduleStore(state => state.setSelectedDate);

  const dates = useMemo(() => {
    const startPoint = selectedDate.subtract(3, 'day');
    return Array.from({ length: 7 }).map((_, i) => startPoint.add(i, 'day'));
  }, [selectedDate]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContainer}>
      {dates.map((date, index) => {
        const isActive = date.isSame(selectedDate, 'day');
        return (
          <TouchableOpacity
            key={index} 
            style={[styles.dateButton, isActive && styles.dateButtonActive]}
            onPress={() => setSelectedDate(date)}
          >
            {isActive && <View style={styles.dot} />}
            <Text style={[styles.dateNumber, isActive && styles.dateTextActive]}>{date.format('D')}</Text>
            <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{date.format('ddd')}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dateSelectorContainer: { paddingHorizontal: SIZES.padding, paddingBottom: SIZES.padding },
  dateButton: { backgroundColor: COLORS.white, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 18, marginRight: 10, alignItems: 'center', minWidth: 60, borderWidth: 1, borderColor: '#E2E8F0' },
  dateButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dot: { position: 'absolute', top: 8, width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
  dateNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  dateDay: { fontSize: 14, color: COLORS.textLight },
  dateTextActive: { color: COLORS.white },
});

export default DateSelector;