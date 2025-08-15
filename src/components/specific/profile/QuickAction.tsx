import { COLORS, FONTS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QuickActions = () => {
  const actions = [
    { name: 'Meds', icon: 'medkit-outline' },
    { name: 'Tracked', icon: 'pulse-outline' },
    { name: 'Documents', icon: 'document-text-outline' },
    { name: 'Download', icon: 'download-outline' },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      {actions.map((action) => (
        <TouchableOpacity key={action.name} style={styles.quickActionButton}>
          <Ionicons name={action.icon as any} size={24} color={COLORS.textDark} />
          <Text style={styles.quickActionText}>{action.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding,
  },
  quickActionButton: {
    backgroundColor: COLORS.primaryLight,
    padding: SIZES.base * 1.5,
    borderRadius: SIZES.radius * 2,
    alignItems: 'center',
    width: (SIZES.width - SIZES.padding * 2 - SIZES.base * 3) / 4, // Chia đều 4 nút
  },
  quickActionText: {
    ...FONTS.body5,
    color: COLORS.textLight,
    marginTop: SIZES.base,
    fontWeight: '500',
  },
});

export default QuickActions;