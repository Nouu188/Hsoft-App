import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS, FONTS, SIZES } from "@/constants/theme";

type SectionHeaderProps = {
  title: string;
  editable?: boolean;
  isEditing?: boolean;
  onToggleEdit?: () => void;
};

export const SectionHeader = ({
  title,
  editable,
  isEditing,
  onToggleEdit,
}: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {editable && (
      <TouchableOpacity
        style={styles.editSectionButton}
        onPress={onToggleEdit}
      >
        <Ionicons
          name={isEditing ? "close" : "pencil"}
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.editSectionButtonText}>
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.padding * 1.5,
    marginBottom: SIZES.padding * 0.8,
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.textDark,
    fontWeight: "bold",
  },
  editSectionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editSectionButtonText: {
    ...FONTS.body4,
    marginLeft: SIZES.base / 2,
  },
});
