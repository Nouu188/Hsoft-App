import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AuthInput from '@/components/specific/auth/AuthInput';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';

interface LoginFormProps {
  isLoading: boolean;
  onLogin: (identifier: string, password: string ) => void;
  onForgotPasswordPress: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoading, onLogin,onForgotPasswordPress  }) => {
  // State riêng chỉ dành cho form này
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handlePressLogin = () => {
    onLogin(identifier, password);
  };

  return (
    <View style={styles.formPage}>
      <Text style={styles.loginHint}>*Bạn có thể đăng nhập bằng CCCD, email hoặc SĐT.</Text>
      <AuthInput icon="person-outline" placeholder="Tài khoản" value={identifier} onChangeText={setIdentifier} />
      <AuthInput icon="lock-closed-outline" placeholder="Mật khẩu" value={password} onChangeText={setPassword} isPassword />
      
      <TouchableOpacity onPress={onForgotPasswordPress}>
        <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.submitButton, { marginBottom: 10 }]} onPress={handlePressLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Đăng nhập</Text>}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <View style={styles.line} />
        <Text style={styles.text}>Hoặc</Text>
        <View style={styles.line} />
      </View>
      
      <TouchableOpacity style={[styles.optionalButton, { flexDirection: 'row' }]}>
        <Ionicons name="logo-google" size={32} color="#DB4437" style={{ paddingRight: 10 }} />
        <Text style={styles.optionalButtonText}>Đăng nhập với tài khoản Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formPage: { width: Dimensions.get('window').width, paddingHorizontal: SIZES.padding, paddingBottom: 20 },
  forgotPassword: { ...FONTS.body4, color: COLORS.primary, textAlign: 'right', marginBottom: SIZES.padding * 1.5, fontWeight: '500' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius * 5, alignItems: 'center', ...SHADOWS.medium, height: SIZES.base * 6.25, justifyContent: 'center',  },
  optionalButton: { backgroundColor: COLORS.white, borderRadius: SIZES.radius * 5, alignItems: 'center', ...SHADOWS.medium, height: SIZES.base * 6.25, justifyContent: 'center' },
  submitButtonText: { ...FONTS.h3, color: COLORS.white, fontWeight: 'bold' },
  optionalButtonText: { ...FONTS.h3, color: COLORS.textDark, fontWeight: 'bold' },
  loginHint: { fontSize: 14, color: COLORS.warning, marginBottom: 5, textAlign: 'center', maxWidth: '90%' },
  textContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#ccc" },
  text: { marginHorizontal: 10, color: "#999", fontWeight: "500" },
});

export default LoginForm;