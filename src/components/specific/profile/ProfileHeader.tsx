import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ProfileStackParamList } from "../../../navigation/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { TouchableOpacity, View } from "react-native";

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
const ProfileHeader = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton}>
        <Ionicons name="menu-outline" size={28} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Profile</Text>
      
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={24} color={COLORS.textDark} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  headerButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h2,
  },
});

export default ProfileHeader;