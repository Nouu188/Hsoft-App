import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Dimensions, Alert } from 'react-native';
import AuthInput from '@/components/specific/auth/AuthInput';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '@/store/useAuthStore';

interface RegisterFormProps {
  navigation: any;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isLoading = useAuthStore(state => state.isLoading);
  const requestOtp = useAuthStore(state => state.requestOtp);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu không khớp.');
    }

    const hoten = `${lastName} ${firstName}`;

    try {
      await requestOtp(email, hoten, password);
      Alert.alert('OTP đã gửi', 'Vui lòng kiểm tra email để nhận mã OTP.');
      navigation.navigate('OTPScreen', { email, hoten, password });
    } catch (error) {
      console.log('[RegisterForm] Request OTP failed', error);
    }
  };

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
      
      <TouchableOpacity style={styles.submitButton} disabled={isLoading} onPress={handleRegister}>
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
