import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {ProfileMenuItemProps} from './types'

// Component hiển thị một mục trong menu profile
const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIconContainer}>
      <Ionicons name={icon as any} size={22} color={COLORS.textDark} />
    </View>

    <Text style={styles.menuItemText}>{text}</Text>

    <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',           // Sắp xếp icon, text, mũi tên theo hàng ngang
    alignItems: 'center',           // Căn giữa theo chiều dọc
    backgroundColor: COLORS.white,  // Nền trắng
    borderRadius: SIZES.radius,     // Bo góc
    padding: SIZES.base * 1.5,      // Padding xung quanh
    marginBottom: SIZES.base * 1.5, // Khoảng cách giữa các mục menu
    ...SHADOWS.light,               // Hiệu ứng shadow nhẹ
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,                 // Bo tròn để tạo hình tròn
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',         // Căn icon giữa theo chiều dọc
    alignItems: 'center',             // Căn icon giữa theo chiều ngang
  },
  menuItemText: {
    ...FONTS.body3,
    flex: 1,                          // Chiếm không gian còn lại giữa icon và mũi tên
    marginLeft: SIZES.padding,        // Khoảng cách với icon bên trái
    fontWeight: '600',
    color: COLORS.textLight,          // Màu chữ nhẹ nhàng
  },
});

export default ProfileMenuItem;
