import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text } from "react-native";
import { Image, TouchableOpacity, View } from "react-native";

// Component hiển thị thông tin người dùng, bao gồm avatar và nút chỉnh sửa
const UserInfo = () => (
  <View style={styles.userInfoContainer}>
    <View style={styles.card}>
      <View style={styles.avatarNameContainer}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} 
          style={styles.avatar} 
        />
        <View style={styles.textContainer}>
          <Text style={styles.userName}>Galangal Richard</Text>
          <Text style={styles.userEmail}>galangal82@gmail.com</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editIconContainer}>
        <Ionicons name="pencil" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  userInfoContainer: {
    paddingBottom:SIZES.padding*2
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.font,
    ...SHADOWS.light,
    elevation: 3,
  },
  avatarNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.font,
  },
  textContainer: {
    justifyContent: 'center',
  },
  userName: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  userEmail: {
    ...FONTS.body4,
    color: COLORS.textLight,
  },
  editIconContainer: {
    backgroundColor: '#E6F0E6', // A light green background for the icon
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserInfo;