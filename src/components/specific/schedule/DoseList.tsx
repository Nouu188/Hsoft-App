import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import DoseCard from "./DoseCard";

const DoseList: React.FC = () => {
  const dosesForSelectedDay = useScheduleStore(state => state.dosesForSelectedDay);
  const isLoading = useScheduleStore(state => state.isLoading);
  const error = useScheduleStore(state => state.error);

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centeredMessage} />;
  }
  if (error) {
    return <Text style={[styles.centeredMessage, styles.errorText]}>Lỗi: {error}</Text>;
  }
  if (dosesForSelectedDay.length === 0) {
    return <Text style={[styles.centeredMessage, styles.emptyText]}>Không có lịch uống thuốc cho ngày này.</Text>;
  }

  return (
    <View style={styles.medCardContainer}>
      {dosesForSelectedDay.map(dose => (
        <DoseCard key={dose.id} dose={dose} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  medCardContainer: { paddingHorizontal: SIZES.padding },
  centeredMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.textLight, fontSize: 16 },
  errorText: { color: COLORS.danger, fontSize: 16 },
});

export default DoseList;