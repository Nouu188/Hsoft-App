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
            style={[styles.dateButton]}
            onPress={() => setSelectedDate(date)}
          >
            <View style={[isActive ? styles.dateButtonActive : { marginTop: 6 }]}>
              {isActive && <View style={styles.dot} />}
              <Text style={[styles.dateNumber]}>{date.format('D')}</Text>
            </View>
            <Text style={[styles.dateDay]}>{date.format('ddd')}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dateSelectorContainer: { paddingHorizontal: SIZES.padding, paddingBottom: SIZES.padding },
  dateButton: { backgroundColor: COLORS.white, borderRadius: 25, paddingBottom: 10, paddingTop: 4, paddingHorizontal: 6, marginRight: 10, alignItems: 'center', justifyContent: 'space-between', minWidth: 54, borderWidth: 1, borderColor: '#E2E8F0' },
  dateButtonActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 6, minWidth: 38, alignItems: 'center'  },
  dot: { position: 'absolute', top: -2, width: 6, height: 6, borderRadius: 2.5, backgroundColor: COLORS.primary },
  dateNumber: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  dateDay: { fontSize: 12, color: COLORS.textLight },
});

export default DateSelector;