// src/components/GroupedDoseCard.tsx

import { COLORS, SIZES } from "@/constants/theme";
import dayjs from "dayjs";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { GroupedDose } from "@/types/dtos/dose/grouped-dose.dto";

interface GroupedDoseCardProps {
  group: GroupedDose;
}

const GroupedDoseCard: React.FC<GroupedDoseCardProps> = ({ group }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alarm-outline" size={21} color={COLORS.primary} />
            <Text style={styles.timeText}>{dayjs(group.time).format("h:mm A")}</Text>
        </View>
        <TouchableOpacity>
            <Text style={styles.underlinedText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={styles.doseList}>
        {group.doses.map((dose) => (
          <View key={dose.id} style={styles.doseItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles-outline" size={18} color={COLORS.textDark} />
            </View>
            <View style={styles.doseInfo}>
              <Text style={styles.medicationName}>{dose.medication_name}</Text>
              <Text style={styles.instructions}>{dose.usage_instructions}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: SIZES.padding*0.8,
    paddingTop: SIZES.padding*0.6,
    paddingBottom: SIZES.padding*0.2,
    marginBottom: SIZES.padding*0.6,
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    // Shadow cho Android
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    marginBottom: SIZES.padding * 0.4,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.white,
    marginVertical: SIZES.padding / 6,
  },
  doseList: {
    marginTop: SIZES.padding / 3,
  },
  doseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.padding / 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doseInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  instructions: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 1,
  },
  underlinedText: {
    fontSize: 15,
    color: '#333',
    textDecorationLine: 'underline',
  },
});

export default GroupedDoseCard;