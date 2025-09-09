import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS, SHADOWS } from '@/constants/theme';

interface Props {
  value: string;
  placeholder?: string;
  isLoading?: boolean;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  dropdownVisible: boolean;
  toggleDropdown: () => void;
  isInputValid: boolean;
}

const HospitalTextInput: React.FC<Props> = ({
  value, placeholder, isLoading, onChangeText, onFocus,
  dropdownVisible, toggleDropdown, isInputValid
}) => (
  <View style={[styles.inputContainer, !isInputValid && value.length > 0 && styles.inputError]}>
    <Ionicons name="medkit-outline" size={22} color={COLORS.textLight} style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
    />
    {isLoading ? (
      <Ionicons name="refresh" size={22} color={COLORS.primary} />
    ) : (
      <TouchableOpacity onPress={toggleDropdown}>
        <Ionicons name={dropdownVisible ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color={COLORS.textLight} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding * 0.8, borderWidth: 2,
    borderColor: 'transparent', height: SIZES.base * 6.25, ...SHADOWS.medium,
  },
  inputError: { borderColor: COLORS.danger },
  icon: { marginRight: SIZES.base * 1.5 },
  input: { flex: 1, ...FONTS.body3, color: COLORS.textDark, height: 55 },
});

export default HospitalTextInput;
