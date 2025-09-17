import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS, FONTS, SIZES } from "@/constants/theme";

type InfoRowProps = {
  label: string;
  value?: string | number | null;
  icon: any;
  showBorder?: boolean;
  editable?: boolean;
  onChangeText?: (text: string) => void;
};

const formatValue = (value?: string | number | null): string =>
  value ? String(value) : "Chưa cập nhật";

export const InfoRow = ({
  label,
  value,
  icon,
  showBorder = true,
  editable = false,
  onChangeText,
}: InfoRowProps) => (
  <View style={[styles.infoRow, !showBorder && { borderBottomWidth: 0 }]}>
    <Ionicons
      name={icon as any}
      size={20}
      color={COLORS.primary}
      style={styles.infoIcon}
    />
    <View style={styles.textContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.infoValue}
          value={value !== undefined && value !== null ? String(value) : ""}
          onChangeText={onChangeText}
          placeholder="Nhập thông tin"
          keyboardType={typeof value === "number" ? "numeric" : "default"}
        />
      ) : (
        <Text style={styles.infoValue}>{formatValue(value)}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoIcon: {
    marginRight: SIZES.base * 1.5,
    width: 24,
    textAlign: "center",
  },
  textContainer: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.body5,
    color: COLORS.placeholderColor,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.textDark,
    fontWeight: "600",
  },
});

export default InfoRow;
