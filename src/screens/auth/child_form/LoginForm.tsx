import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ScrollView,Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AuthInput from '@/components/specific/auth/AuthInput';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginFormProps {
  isLoading: boolean;
  onLogin: (identifier: string, password: string, useHospital: boolean) => void; // gửi luôn useHospital
  onForgotPasswordPress: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  isLoading,
  onLogin,
  onForgotPasswordPress,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [useHospital, setUseHospital] = useState(true); // <- state nội bộ
  const [hospitalSelected, setHospitalSelected] = useState('');

  const isGoogleLoading = useAuthStore(state => state.isGoogleLoading);
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);

  const handleLogin = () => {
    if (!identifier.trim() || !password.trim()) {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
    return;
  }
    onLogin(identifier, password, useHospital);
  };
  const hospitals = [
  "Bệnh viện Bạch Mai",
  "Bệnh viện Chợ Rẫy",
  "Bệnh viện Đa khoa Hòa Bình",
  "Bệnh viện Đa khoa Trung ương Huế",
  "Bệnh viện Đại học Y Dược TP.HCM",
  "Bệnh viện Hữu Nghị Việt Đức",
  "Bệnh viện K",
  "Bệnh viện Nhi Trung ương",
  "Bệnh viện Nhiệt đới Trung ương",
  "Bệnh viện Phụ Sản Hà Nội",
  "Bệnh viện Phụ Sản TP.HCM",
  "Bệnh viện Tai Mũi Họng Trung ương",
  "Bệnh viện Thống Nhất",
  "Bệnh viện Trưng Vương",
  "Bệnh viện Việt Nam – Cu Ba"
];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.loginHint}>
        {useHospital ? 'Bạn có thể đăng nhập bằng SĐT hoặc CCCD' : 'Đăng nhập bằng email'}
      </Text>

      <AuthInput icon="person-outline" placeholder="Tài khoản" value={identifier} onChangeText={setIdentifier} />
      <AuthInput icon="lock-closed-outline" placeholder="Mật khẩu" value={password} onChangeText={setPassword} isPassword />

      {useHospital=== false && (
        <AuthInput
          icon="medkit-outline"
          placeholder="Chọn bệnh viện"
          value={hospitalSelected}
          onChangeText={setHospitalSelected}
          isListPressed
          listItems={hospitals}
          onSelectItem={setHospitalSelected}
        />
      )}

      <View style={styles.footerRow}>
        <TouchableOpacity onPress={() => setUseHospital(prev => !prev)}>
          <Text style={styles.toggleText}>
            {useHospital ? 'Bạn đã có tài khoản bệnh viện?' : 'Đăng nhập bằng email?'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onForgotPasswordPress}>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading || isGoogleLoading}>
        {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.loginButtonText}>Đăng nhập</Text>}
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Hoặc</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={loginWithGoogle} disabled={isLoading || isGoogleLoading}>
        {isGoogleLoading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            <Ionicons name="logo-google" size={24} color={COLORS.danger} style={{ marginRight: 10 }} />
            <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 50,
  },
  loginHint: {
    fontSize: 14,
    color: COLORS.warning,
    marginBottom: 10,
    paddingLeft: 5,
    maxWidth: '90%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  toggleText: {
    textDecorationLine: 'underline',
    ...FONTS.body4,
    color: COLORS.introduction,
    fontWeight: '500',
  },
  forgotPassword: {
    ...FONTS.body4,
    color: COLORS.introduction,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: COLORS.introduction,
    borderRadius: SIZES.radius * 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  loginButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    height: 50,
    ...SHADOWS.medium,
  },
  googleButtonText: {
    ...FONTS.h3,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
});

export default LoginForm;
