import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme'; 
import { SearchBarProps } from './types';  

// Component SearchBar nhận props:
// - value: giá trị text hiện tại trong ô tìm kiếm
// - onChangeText: hàm xử lý khi text thay đổi
const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.searchContainer}>
      {/* Thanh tìm kiếm gồm icon + input */}
      <View style={styles.searchBar}>
        {/* Icon kính lúp */}
        <Ionicons
          name="search-outline"
          size={22}
          color={COLORS.secondary}
          style={styles.searchIcon}
        />

        {/* Ô nhập liệu tìm kiếm */}
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm ghi chú..."   
          placeholderTextColor={COLORS.secondary} 
          value={value}             
          onChangeText={onChangeText} 
        />
      </View>
    </View>
  );
};

// Định nghĩa style
const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: SIZES.padding,  // khoảng cách 2 bên
    marginTop: SIZES.base * 2,         // đẩy xuống dưới một chút
  },
  searchBar: {
    flexDirection: 'row',              // xếp icon và input theo hàng ngang
    alignItems: 'center',              // căn giữa theo chiều dọc
    backgroundColor: COLORS.white,     // nền trắng
    borderRadius: SIZES.radius,        // bo tròn viền
    paddingHorizontal: SIZES.padding,  // padding 2 bên
    height: 50,                        // chiều cao thanh tìm kiếm
    ...SHADOWS.light,                  // hiệu ứng bóng đổ nhẹ
  },
  searchIcon: { 
    marginRight: 10,                   // cách icon ra khỏi input
  },
  searchInput: { 
    flex: 1,                           // chiếm hết phần còn lại
    fontSize: SIZES.body3,             // kích thước chữ
    color: COLORS.text,                // màu chữ chính
  },
});

export default SearchBar; // Xuất để dùng lại
