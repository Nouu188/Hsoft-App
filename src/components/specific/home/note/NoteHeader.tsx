// Component Header cho màn hình Ghi chú
// - Hiển thị nút quay lại (back)
// - Hiển thị tiêu đề "Ghi chú" ở giữa
// - Hiển thị nút cài đặt (settings) ở bên phải

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { HeaderProps } from './types';

// Nhận vào props: onBackPress (xử lý khi bấm nút quay lại),
// onSettingsPress (xử lý khi bấm nút cài đặt)
const Header: React.FC<HeaderProps> = ({ onBackPress, onSettingsPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Tiêu đề ở giữa */}
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Ghi chú</Text>
      </View>

      {/* Nút cài đặt */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
// StyleSheet cho Header
const styles = StyleSheet.create({
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.padding, 
    marginTop: SIZES.padding * 2 
  },
  backButton: { 
    width: 44, height: 44, borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: COLORS.border, 
    backgroundColor: COLORS.white 
  },
  titleContainer: { 
    position: 'absolute', 
    left: 0, right: 0, 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: SIZES.h3, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  headerActions: { flexDirection: 'row' },
  iconButton: { marginLeft: 20 },
});

export default Header;
