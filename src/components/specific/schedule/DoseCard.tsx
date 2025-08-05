import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { Dose } from "@/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import dayjs from "dayjs";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DoseCard: React.FC<{ dose: Dose }> = ({ dose }) => {
  const updateDoseStatus = useScheduleStore(state => state.updateDoseStatus);
  const isTaken = dose.status === 'TAKEN';
  const isSkipped = dose.status === 'SKIPPED';
  const isPending = dose.status === 'PENDING';
  const isPastDue = dayjs().isAfter(dayjs(dose.due_at));

  const handleUpdateStatus = (newStatus: 'TAKEN' | 'SKIPPED') => {
    // Chỉ cho phép cập nhật nếu trạng thái hiện tại khác
    if (dose.status !== newStatus) {
      updateDoseStatus(dose.id, newStatus);
    }
  };

  return (
    <View style={[styles.medCard, (isTaken || isSkipped) && styles.medCardCompleted]}>
      <View style={styles.medCardHeader}>
        <Text style={styles.medTitle}>{dose.medication_name}</Text>
        <View style={styles.timeContainer}>
          <Ionicons name="alarm-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.timeText}>{dayjs(dose.due_at).format('h:mm A')}</Text>
        </View>
      </View>
      <Text style={styles.medSubtitle}>{dose.dosage_instructions}</Text>
      {dose.usage_instructions && <Text style={styles.medUsage}>{dose.usage_instructions}</Text>}
      
      <View style={styles.medCardActions}>
        <TouchableOpacity 
          style={[styles.actionChip, isSkipped && styles.actionChipSkipped]}
          onPress={() => handleUpdateStatus('SKIPPED')}
        >
          <Ionicons name="close-outline" size={20} color={isSkipped ? COLORS.white : COLORS.danger} />
          <Text style={[styles.actionChipText, isSkipped && styles.actionChipTextActive]}>Bỏ qua</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionChip, isTaken && styles.actionChipTaken]}
          onPress={() => handleUpdateStatus('TAKEN')}
        >
          <Ionicons name="checkmark-outline" size={20} color={isTaken ? COLORS.white : COLORS.success} />
          <Text style={[styles.actionChipText, isTaken && styles.actionChipTextActive]}>Đã uống</Text>
        </TouchableOpacity>
      </View>
      {isPending && isPastDue && <View style={styles.missedIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  medCardContainer: { paddingHorizontal: SIZES.padding },
  medCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius * 1.5, padding: SIZES.padding, marginBottom: SIZES.padding, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  medCardCompleted: { backgroundColor: '#F8F9FA', opacity: 0.8 },
  medCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.padding / 2 },
  medTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textDark, flex: 1 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radius },
  timeText: { marginLeft: 5, color: COLORS.textDark, fontWeight: '500' },
  medSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  medUsage: { fontSize: 14, color: COLORS.textDark, marginTop: 8, fontStyle: 'italic' },
  medCardActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: SIZES.padding, gap: 10 },
  actionChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  actionChipText: { marginLeft: 6, fontWeight: '600' },
  actionChipTaken: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  actionChipSkipped: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  actionChipTextActive: { color: COLORS.white },
  missedIndicator: { position: 'absolute', top: 10, left: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.warning },
});

export default DoseCard;