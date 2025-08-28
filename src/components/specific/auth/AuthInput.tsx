import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import type { AuthInputProps } from './types';

// Component input đa năng, hỗ trợ:
// - Hiển thị icon bên trái
// - Hiển thị lỗi
// - Hỗ trợ password show/hide
// - Hỗ trợ dropdown list chọn item
const AuthInput: React.FC<AuthInputProps> = ({
  icon,             // icon hiển thị bên trái
  placeholder,      // text placeholder
  value,            // giá trị input
  onChangeText,     // hàm gọi khi text thay đổi
  isPassword = false,   // true nếu là password input
  isListPressed = false, // true nếu muốn hiển thị dropdown list
  error,            // message lỗi
  listItems = [],   // danh sách dropdown
  onSelectItem,     // hàm gọi khi chọn item dropdown
}) => {
  const [isFocused, setIsFocused] = useState(false); // trạng thái focus input
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // trạng thái hiển thị password
  const [isListPressedVisible, setListPressedVisible] = useState(false); // trạng thái hiển thị dropdown

  // Lọc danh sách dropdown theo giá trị input
  const filteredList = useMemo(() => {
    if (!value) return listItems;
    return listItems.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, listItems]);

  // Chọn item từ dropdown
  const handleSelectItem = (item: string) => {
    onSelectItem && onSelectItem(item); // gọi callback
    setListPressedVisible(false);       // ẩn dropdown sau khi chọn
  };

  return (
    <View style={{ marginBottom: SIZES.padding }}>
      <View style={[
          styles.inputContainer, 
          isFocused && styles.inputContainerFocused, 
          error && styles.inputContainerError
        ]}
      >
        <Ionicons
          name={icon as any}
          size={22}
          color={isFocused ? COLORS.primary : COLORS.textLight}
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={text => {
            onChangeText(text);
            if (!isListPressedVisible && isListPressed) setListPressedVisible(true);
          }}
          secureTextEntry={isPassword && !isPasswordVisible} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}

        {isListPressed && (
          <TouchableOpacity onPress={() => setListPressedVisible(!isListPressedVisible)}>
            <Ionicons
              name={isListPressedVisible ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={22}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>

      {isListPressedVisible && filteredList.length > 0 && (
        <View style={styles.dropdownContainer}>
          {filteredList.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.dropdownItem} 
              onPress={() => handleSelectItem(item)}
            >
              <Text style={styles.dropdownText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.8,
    borderWidth: 2,
    borderColor: 'transparent',
    height: SIZES.base * 6.25,
    ...SHADOWS.medium,
  },
  inputContainerFocused: { borderColor: COLORS.primary },
  inputContainerError: { borderColor: COLORS.danger },
  icon: { marginRight: SIZES.base * 1.5 },
  input: { flex: 1, ...FONTS.body3, color: COLORS.textDark, height: 55 },
  dropdownContainer: {
    backgroundColor: COLORS.primaryLight,
    marginTop: 5,
    ...SHADOWS.light,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderBottomColor: COLORS.textLight,
    borderBottomWidth: 0.5,
  },
  dropdownText: { ...FONTS.body3, color: COLORS.textDark },
  errorText: { ...FONTS.body5, color: COLORS.danger, marginTop: SIZES.base / 2, marginLeft: SIZES.base },
});

export default AuthInput;
