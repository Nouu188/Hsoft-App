import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text } from "react-native";
import { Image, TouchableOpacity, View } from "react-native";

const UserInfo = () => (
  <View style={styles.userInfoContainer}>
    <View>
      <Image 
        source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} 
        style={styles.avatar} 
      />
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="pencil" size={12} color={COLORS.primary} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    ...SHADOWS.light,
  },
  editButtonText: {
    ...FONTS.body5,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SIZES.base / 2,
  },
});

export default UserInfo;