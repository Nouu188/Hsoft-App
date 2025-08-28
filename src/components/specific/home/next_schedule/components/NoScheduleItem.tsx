import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

// 🟢 Component hiển thị khi không có lịch trình nào sắp tới
const NoScheduleItem: React.FC = () => {
  return (
    <View style={styles.wrapper}>
      {/* Khung chứa thông báo */}
      <View style={styles.container}>
        <Text style={styles.noScheduleText}>
          🎉 Tuyệt vời! Không có lịch trình nào sắp tới.
        </Text>
      </View>
    </View>
  );
};

// 🎨 StyleSheet cho component
const styles = StyleSheet.create({
  // Bọc ngoài cùng, tạo khoảng cách lề và padding
  wrapper: {
    paddingHorizontal: SIZES.padding,   // padding ngang theo theme
    marginBottom: SIZES.padding,        // khoảng cách dưới
  },

  // Container chính cho thông báo
  container: {
    flexDirection: 'row',               // sắp xếp con theo hàng ngang
    alignItems: 'center',               // căn giữa theo trục dọc
    justifyContent: 'center',           // căn giữa theo trục ngang
    height: 60,                         // chiều cao box
    backgroundColor: COLORS.lightGray,  // màu nền xám nhạt
    borderRadius: SIZES.radius,         // bo góc
    paddingHorizontal: SIZES.padding * 0.8, // padding ngang
    ...SHADOWS.light,                   // đổ bóng nhẹ (theo theme)
  },

  // Style cho dòng chữ thông báo
  noScheduleText: {
    fontSize: SIZES.font,               // cỡ chữ theo theme
    color: COLORS.textLight,            // màu chữ xám nhạt
    fontStyle: 'italic',                // chữ in nghiêng
  },
});

export default NoScheduleItem;
