import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons'; 
import { SIZES, COLORS } from '@/constants/theme';       
import { GridItemProps } from '../types';           

// Component GridItem: hiển thị một ô trong lưới (icon + tên)
// Dùng React.memo để tránh re-render khi props không đổi
const GridItem: React.FC<GridItemProps> = React.memo(({ item, itemSize }) => {
  return (
    <TouchableOpacity
      onPress={item.onPress} // sự kiện khi bấm vào ô
      style={[styles.itemContainer, { width: itemSize }]} // set chiều rộng động
    >
      {/* Vùng icon */}
      <View style={[styles.iconWrapper, { backgroundColor: COLORS.primary }]}>
        <Ionicons
          name={item.iconName}               // tên icon (vd: "home-outline")
          size={28}                          // kích thước icon
          color={item.iconColor || COLORS.white} // màu icon, mặc định trắng
        />
      </View>

      {/* Tên hiển thị dưới icon */}
      <Text style={styles.itemName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
});

// Style cho component
const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',              // căn giữa icon + text theo chiều ngang
    marginBottom: SIZES.padding * 1.5, // khoảng cách giữa các hàng
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,                  // bo tròn icon nền
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,          // khoảng cách giữa icon và text
  },
  itemName: {
    fontSize: 12,                      // cỡ chữ nhỏ
    color: COLORS.text,                // màu chữ từ theme
    textAlign: 'center',               // căn giữa chữ
    height: 30,                        // giữ chiều cao đồng đều để lưới thẳng hàng
  },
});

export default GridItem; // xuất component để dùng nơi khác
