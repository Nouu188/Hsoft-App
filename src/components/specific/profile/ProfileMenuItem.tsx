import { FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native";
import { ProfileMenuItemProps } from "./types";
import { useThemeStore } from "@/store/useThemeStore";

const ProfileMenuItem: React.FC<ProfileMenuItemProps & { 
  isSwitch?: boolean; 
  switchValue?: boolean; 
  onSwitchChange?: (value: boolean) => void; 
}> = ({
  icon,
  text,
  onPress,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
}) => {
  const { theme } = useThemeStore(); // ✅ lấy theme từ store

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: theme.white, shadowColor: theme.textDark },
      ]}
      onPress={isSwitch ? undefined : onPress}
      activeOpacity={isSwitch ? 1 : 0.2}
    >
      {/* Icon trái */}
      {icon && (
        <View
          style={[
            styles.menuItemIconContainer,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons name={icon as any} size={22} color={theme.textDark} />
        </View>
      )}

      {/* Text */}
      <Text style={[styles.menuItemText, { color: theme.text }]}>{text}</Text>

      {/* Switch hoặc mũi tên */}
      {isSwitch ? (
        <Switch
          trackColor={{ false: theme.border, true: theme.introduction }}
          thumbColor={switchValue ? theme.lightBlue : theme.white}
          ios_backgroundColor={theme.border}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <Ionicons
          name="chevron-forward-outline"
          size={22}
          color={theme.textLight}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SIZES.radius,
    padding: SIZES.base * 1.5,
    marginBottom: SIZES.base * 1.5,
    ...SHADOWS.light,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    ...FONTS.body3,
    flex: 1,
    marginLeft: SIZES.padding,
    fontWeight: "600",
  },
});

export default ProfileMenuItem;
