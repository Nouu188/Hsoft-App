import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme'; // Giả sử bạn có file theme constants

// Định nghĩa các props mà component sẽ nhận vào
interface NextScheduleItemProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

/**
 * Component hiển thị thông báo cho một lịch trình sắp tới.
 * @param {string} iconName - Tên của icon từ thư viện Ionicons.
 * @param {string} iconBgColor - Màu nền cho icon.
 * @param {string} title - Tiêu đề chính của lịch trình (ví dụ: "Uống 1 viên Panadol").
 * @param {string} subtitle - Thông tin phụ (ví dụ: "Vào lúc 14:00 hôm nay").
 * @param {() => void} onPress - Hàm được gọi khi người dùng nhấn vào.
 */
const NextScheduleItem: React.FC<NextScheduleItemProps> = ({
  iconName,
  iconBgColor,
  title,
  subtitle,
  onPress,
}) => {
  return (
    
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Phần Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={24} color={COLORS.primary} />
      </View>

      {/* Phần Nội dung Text */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>
      </View>
       {/* Mũi tên điều hướng */}
      <View>
        <Ionicons name="chevron-forward-outline" size={24} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Component đơn giản để hiển thị khi không có lịch trình nào.
 */
export const NoScheduleItem: React.FC = () => {
    return (
        <View style={[styles.container, styles.noScheduleContainer]}>
            <Text style={styles.noScheduleText}>🎉 Tuyệt vời! Không có lịch trình nào sắp tới.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height:60,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.8,
    marginHorizontal: SIZES.padding, // Căn đều 2 bên
    marginTop:10,
    
    marginBottom: SIZES.padding,
    // Thêm hiệu ứng đổ bóng cho đẹp hơn
    elevation: 3, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22, // Bo tròn thành hình tròn
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding * 0.8,
  },
  textContainer: {
    flex: 1, // Quan trọng: Giúp text chiếm hết không gian còn lại
    justifyContent: 'center',
    height: '100%', 
  },
  titleText: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  noScheduleContainer: {
    justifyContent: 'center',
    backgroundColor: '#F8F9FA' // Màu nền hơi khác một chút
  },
  noScheduleText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    fontStyle: 'italic',
  }
});

export default NextScheduleItem;