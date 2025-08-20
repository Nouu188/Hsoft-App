import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import AuthInput from '@/components/specific/auth/AuthInput';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';

interface RegisterFormProps {
  isLoading: boolean;
  onRegister: (data: any) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ isLoading}) => {
  // State riêng cho form đăng ký
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <View style={styles.formPage}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 5 }}>
          <AuthInput icon="person-add-outline" placeholder="Họ" value={lastName} onChangeText={setLastName} />
        </View>
        <View style={{ flex: 1 }}>
          <AuthInput icon="person-add-outline" placeholder="Tên" value={firstName} onChangeText={setFirstName} />
        </View>
      </View>
      <AuthInput icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AuthInput icon="lock-closed-outline" placeholder="Mật khẩu mới" value={password} onChangeText={setPassword} isPassword />
      <AuthInput icon="lock-closed-outline" placeholder="Xác nhận mật khẩu mới" value={confirmPassword} onChangeText={setConfirmPassword} isPassword />
      
      <TouchableOpacity style={styles.submitButton} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Tạo tài khoản mới</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formPage: { width: Dimensions.get('window').width, paddingHorizontal: SIZES.padding, paddingBottom: 20 },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius * 5, alignItems: 'center', ...SHADOWS.medium, height: SIZES.base * 6.25, justifyContent: 'center', marginTop: SIZES.padding },
  submitButtonText: { ...FONTS.h3, color: COLORS.white, fontWeight: 'bold' },
});

export default RegisterForm;