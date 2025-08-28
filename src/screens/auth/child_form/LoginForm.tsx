import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AuthInput from '@/components/specific/auth/AuthInput';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useHospitalStore } from '@/store/useHospitalsStore';

interface LoginFormProps {
  identifier: string;
  password: string;
  useHospital: boolean;
  selectedHospitalCode: string;
  isLoading: boolean;
  setUseHospital: (value: boolean) => void;
  setSelectedHospitalCode: (code: string) => void;
  onLogin: (identifier: string, password: string) => void;
  onForgotPasswordPress: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  identifier,
  password,
  useHospital,
  selectedHospitalCode,
  isLoading,
  setUseHospital,
  setSelectedHospitalCode,
  onLogin,
  onForgotPasswordPress,
}) => {
  const [localIdentifier, setLocalIdentifier] = useState(identifier);
  const [localPassword, setLocalPassword] = useState(password);
  const { hospitals, fetchHospitals, isLoading: isHospitalsLoading } = useHospitalStore();

  useEffect(() => { if (useHospital) fetchHospitals(); }, [useHospital]);

  return (
    <View style={{ flex: 1, paddingHorizontal: SIZES.padding, justifyContent: 'center' }}>
      <AuthInput
        icon="person-outline"
        placeholder={useHospital ? 'Số điện thoại / CCCD' : 'Email'}
        value={localIdentifier}
        onChangeText={setLocalIdentifier}
      />
      <AuthInput
        icon="lock-closed-outline"
        placeholder="Mật khẩu"
        value={localPassword}
        onChangeText={setLocalPassword}
        isPassword
      />
      {useHospital && (
        <AuthInput
          icon="medkit-outline"
          placeholder="Chọn bệnh viện"
          value={selectedHospitalCode}
          isListPressed
          listItems={hospitals.map(h => ({ label: h.name, value: h.externalCode }))}
          isLoading={isHospitalsLoading}
          onChangeText={setSelectedHospitalCode}
          onSelectItem={setSelectedHospitalCode}
        />
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => setUseHospital(!useHospital)}>
          <Text style={{ textDecorationLine: 'underline', ...FONTS.body4, color: COLORS.introduction, fontWeight: '500' }}>
            {useHospital ? 'Đăng nhập bằng email?' : 'Bạn có tài khoản bệnh viện?'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{ backgroundColor: COLORS.introduction, borderRadius: SIZES.radius * 5, alignItems: 'center', justifyContent: 'center', height: 60, marginBottom: 5 }}
        onPress={() => onLogin(localIdentifier, localPassword)}
        disabled={isLoading || isHospitalsLoading}
      >
        {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={{ ...FONTS.h3, color: COLORS.white, fontWeight: 'bold' }}>Đăng nhập</Text>}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableOpacity onPress={onForgotPasswordPress}>
          <Text style={{ ...FONTS.body4, color: COLORS.introduction, fontWeight: '500', textDecorationLine: 'underline' }}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
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
