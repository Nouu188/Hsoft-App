import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { NextScheduleItemProps } from '../types';

// 🟢 Component hiển thị một lịch hẹn/lịch trình sắp tới
const NextScheduleItem: React.FC<NextScheduleItemProps> = ({
  iconName,      // tên icon Ionicons (ví dụ: "calendar", "medkit", ...)
  iconBgColor,   // màu nền của vòng tròn chứa icon
  title,         // tiêu đề chính (ví dụ: "Khám sức khỏe tổng quát")
  subtitle,      // tiêu đề phụ (ví dụ: "Thứ 3, 15/09/2025 - 9:00 AM")
  onPress,       // callback khi nhấn vào item
}) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress} 
        activeOpacity={0.7}   
      >

        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={24} color={COLORS.primary} />
        </View>


        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        

        <Ionicons 
          name="chevron-forward-outline" 
          size={24} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

// 🎨 StyleSheet cho component
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SIZES.padding,         // padding ngang theo theme
    marginBottom: SIZES.padding / 4,          // khoảng cách dưới
  },
  container: {
    flexDirection: 'row',                     // sắp xếp con theo hàng ngang
    alignItems: 'center',                     // căn giữa theo trục dọc
    height: 60,
    backgroundColor: COLORS.white,            // nền trắng
    borderRadius: SIZES.radius,               // bo góc
    padding: SIZES.padding * 0.8,
    ...SHADOWS.medium,                        // đổ bóng vừa
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,                         // bo tròn thành hình tròn
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding * 0.8,         // cách chữ
  },
  textContainer: {
    flex: 1,                                  // chiếm toàn bộ chiều ngang còn lại
    justifyContent: 'center',
  },
  titleText: {
    fontSize: SIZES.font,
    fontWeight: '600',                        // chữ đậm
    color: COLORS.textDark,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,                             // cách tiêu đề 1 chút
  },
});

export default NextScheduleItem;
