import { COLORS } from "@/constants/theme";
import { Dose } from "@/types/dtos/dose/dose.dto";
import Ionicons from "@react-native-vector-icons/ionicons";
import dayjs from "dayjs";
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from "react-native";

const SIZES = {
  padding: 20,
  radius: 12,
};

// Thêm prop `style` để nhận kích thước từ component cha
interface DoseCardProps {
  dose: Dose;
  style?: StyleProp<ViewStyle>;
}

const DoseCard: React.FC<DoseCardProps> = ({ dose, style }) => {
  return (
    // Sử dụng TouchableOpacity để toàn bộ card có thể được nhấn vào
    <TouchableOpacity style={[styles.card, style]}>
      {/* Phần trên: Icon và Tên thuốc */}
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          {/* Icon hoa thị như trong ảnh */}
          <Ionicons name="sparkles-outline" size={18} color={COLORS.textDark} />
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medTitle} numberOfLines={1}>{dose.medication_name}</Text>
          <Text style={styles.medSubtitle} numberOfLines={2}>{dose.usage_instructions}</Text>
        </View>
      </View>

      {/* Phần dưới: Thời gian và Nút chi tiết */}
      <View style={styles.bottomSection}>
        <View style={styles.timeContainer}>
          <Ionicons name="volume-medium-outline" size={18} color={COLORS.textDark} />
          <Text style={styles.timeText}>{dayjs(dose.due_at).format('h:mm a')}</Text>
        </View>

        <View style={styles.detailsButton}>
          <Ionicons name="arrow-forward-outline" size={20} color={COLORS.textDark} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius * 2, 
    padding: SIZES.padding * 0.7, 
    justifyContent: 'space-between',
    height: 180,
    width: 180,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding / 2,
  },
  medInfo: {
    flex: 1,
  },
  medTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  medSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30, // Bo góc lớn để có hình viên thuốc
  },
  timeText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    textTransform: 'lowercase',
  },
  detailsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DoseCard;