import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text } from "react-native";
import { Image, TouchableOpacity, View } from "react-native";

// Component hiển thị thông tin người dùng, bao gồm avatar và nút chỉnh sửa
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
  // Container chính, căn giữa avatar
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  // Avatar người dùng: hình tròn, có viền trắng
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,       // Bo tròn thành hình tròn
    borderWidth: 3,         // Viền dày 3
    borderColor: COLORS.white,
  },
  // Nút chỉnh sửa profile
  editButton: {
    position: 'absolute',    // Đặt lên avatar
    bottom: 0,               // Cạnh dưới
    right: 0,                // Cạnh phải
    flexDirection: 'row',    // Icon + text trên cùng 1 hàng
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    ...SHADOWS.light,        // Bóng nhẹ
  },
  // Text trong nút chỉnh sửa
  editButtonText: {
    ...FONTS.body5,          // Font body nhỏ
    color: COLORS.textLight, // Màu chữ nhẹ
    fontWeight: '600',       // Đậm vừa phải
    marginLeft: SIZES.base / 2, // Khoảng cách so với icon
  },
});

export default UserInfo;
