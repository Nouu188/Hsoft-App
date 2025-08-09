// src/components/AuthInput.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';

interface AuthInputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ icon, placeholder, value, onChangeText, isPassword = false, error }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={{ marginBottom: SIZES.padding }}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused, error && styles.inputContainerError]}>
        <Ionicons name={icon as any} size={22} color={isFocused ? COLORS.primary : COLORS.textLight} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
  },
  icon: {
    marginRight: SIZES.base * 1.5,
  },
  input: {
    flex: 1,
    ...FONTS.body3,
    color: COLORS.textDark,
    height: 55,
  },
  errorText: {
    ...FONTS.body5,
    color: COLORS.danger,
    marginTop: SIZES.base / 2,
    marginLeft: SIZES.base,
  },
});

export default AuthInput;