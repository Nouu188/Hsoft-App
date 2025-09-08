import { FONTS, SIZES } from "@/constants/theme";
import { ProfileStackParamList } from "../../../navigation/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "@/store/useThemeStore";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "Profile"
>;

const ProfileHeader: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme } = useThemeStore(); // ✅ lấy theme từ store

  return (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>

      {/* Share button */}
      <TouchableOpacity style={styles.headerButton}>
        <Ionicons name="share-outline" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    paddingTop: SIZES.padding * 0.5,
    borderBottomWidth: 0.2,
    height: 150,
  },
  headerButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h2,
    fontWeight: "bold",
  },
});

export default ProfileHeader;
