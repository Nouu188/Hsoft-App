import { FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, Image, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "@/store/useThemeStore";

const UserInfo: React.FC = () => {
  const { theme, isDarkMode } = useThemeStore(); 

  return (
    <View style={styles.userInfoContainer}>
      <View style={[styles.card, { backgroundColor: theme.white }]}>
        <View style={styles.avatarNameContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.userName, { color: theme.textDark }]}>
              Galangal Richard
            </Text>
            <Text style={[styles.userEmail, { color: theme.textLight }]}>
              galangal82@gmail.com
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.editIconContainer,
            { backgroundColor: isDarkMode ? theme.primaryLight : "#E6F0E6" },
          ]}
        >
          <Ionicons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    paddingBottom: SIZES.padding * 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: SIZES.radius,
    padding: SIZES.font,
    ...SHADOWS.light,
    elevation: 3,
  },
  avatarNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.font,
  },
  textContainer: {
    justifyContent: "center",
  },
  userName: {
    ...FONTS.h4,
    fontWeight: "bold",
  },
  userEmail: {
    ...FONTS.body4,
  },
  editIconContainer: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserInfo;
