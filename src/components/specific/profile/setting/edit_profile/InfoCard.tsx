import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";

export const InfoCard = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.infoCard}>{children}</View>
);

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base,
  },
});
