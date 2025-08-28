import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import type { AuthInputProps } from './types';
interface DropdownItem {
  label: string;
  value: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  placeholder,
  value,
  isPassword = false,
  isListPressed = false,
  error,
  listItems = [],
  isLoading = false,
  onChangeText,
  onSelectItem,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const displayLabel = useMemo(() => {
    const found = listItems.find(item => item.value === value);
    return found ? found.label : value || '';
  }, [value, listItems]);

  const filteredList = useMemo(() => {
    if (!displayLabel) return listItems;
    return listItems.filter(
      item =>
        item.label.toLowerCase().includes(displayLabel.toLowerCase()) ||
        item.value.toLowerCase().includes(displayLabel.toLowerCase())
    );
  }, [displayLabel, listItems]);

  const handleSelectItem = (item: DropdownItem) => {
    onSelectItem && onSelectItem(item.value); // trả về value thực
    setDropdownVisible(false);
  };
  return (
    <View style={{ marginBottom: SIZES.padding }}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={22}
            color={isFocused ? COLORS.primary : COLORS.textLight}
            style={styles.icon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={displayLabel}
          secureTextEntry={isPassword && !isPasswordVisible}
          onChangeText={text => onChangeText && onChangeText(text)}
          onFocus={() => {
            setIsFocused(true);
            if (isListPressed) setDropdownVisible(true);
          }}
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

        {isListPressed && !isLoading && (
          <TouchableOpacity onPress={() => setDropdownVisible(prev => !prev)}>
            <Ionicons
              name={isDropdownVisible ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={22}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}

        {isLoading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 5 }} />
        )}
      </View>

      {isDropdownVisible && !isLoading && filteredList.length > 0 && (
        <View style={[styles.dropdownContainer, { position: 'absolute', zIndex: 999 }]}>
          <FlatList
            data={filteredList}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectItem(item)}>
                <Text style={styles.dropdownText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 150 }}
          />
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
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    marginTop: 60,
    ...SHADOWS.light,
    borderRadius: SIZES.radius,
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
