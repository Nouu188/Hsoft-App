import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants/theme";

export const Avatar = ({ uri }: { uri: string }) => (
  <View style={styles.headerAvatarContainer}>
    <Image source={{ uri }} style={styles.headerAvatar} />
  </View>
);

const styles = StyleSheet.create({
  headerAvatarContainer: {
    alignItems: "center",
    marginBottom: SIZES.padding * 0.5,
  },
  headerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: SIZES.base,
  },
});
