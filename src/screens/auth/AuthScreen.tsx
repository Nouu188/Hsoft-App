import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import LoginForm from './child_form/LoginForm';
import RegisterForm from './child_form/RegisterForm';
import { useAuthForm } from './useAuthForm';

const { width } = Dimensions.get('window');

export const buildLoginPayload = (account: string, password: string) => {
  const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const isPhoneNumber = (value: string) => /^0\d{9}$/.test(value);
  const isCCCD = (value: string) => /^\d{12}$/.test(value);

  if (isEmail(account)) return { email: account, password };
  if (isPhoneNumber(account) || isCCCD(account)) return { identifier: account, password };
  return { identifier: account, password };
};

const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isLoginView, formAnimatedStyle, switchToLogin, switchToRegister } = useAuthForm();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  // State quản lý chế độ bệnh viện/email và bệnh viện chọn
  const [useHospital, setUseHospital] = useState(true);
  const [selectedHospitalCode, setSelectedHospitalCode] = useState('');

  const handleLogin = async (identifier: string, password: string) => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }
    if (useHospital && !selectedHospitalCode) {
      Alert.alert('Lỗi', 'Vui lòng chọn bệnh viện.');
      return;
    }

    const payload = {
      email: useHospital ? undefined : identifier,
      phoneNumber: useHospital ? identifier : undefined,
      externalHospitalCode: useHospital ? selectedHospitalCode : undefined,
      password,
    };

    console.log(payload)

    try {
      await login(payload);
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e.message || 'Có lỗi xảy ra.');
    }
  };

  const handleForgotPassword = () => navigation.navigate('ForgotPasswordScreen');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="medkit" size={60} color={COLORS.introduction} />
          <Text style={styles.title}>MedPlus</Text>
          <Text style={styles.subtitle}>Your daily health partner</Text>
        </View>

        {/* Toggle */}
        <View style={{ paddingHorizontal: SIZES.padding * 0.8 }}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={styles.toggleButton} onPress={switchToLogin}>
              <Text style={[styles.toggleText, isLoginView ? styles.toggleTextActive : styles.toggleTextInactive]}>Đăng nhập</Text>
              {isLoginView && <Animated.View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleButton} onPress={switchToRegister}>
              <Text style={[styles.toggleText, !isLoginView ? styles.toggleTextActive : styles.toggleTextInactive]}>Đăng ký</Text>
              {!isLoginView && <Animated.View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={{ }}>
          <Animated.View style={[{ flexDirection: 'row', width: width * 2 }, formAnimatedStyle]}>
            <LoginForm
              identifier=""
              password=""
              useHospital={useHospital}
              selectedHospitalCode={selectedHospitalCode}
              setUseHospital={setUseHospital}
              setSelectedHospitalCode={setSelectedHospitalCode}
              onLogin={handleLogin}
              onForgotPasswordPress={handleForgotPassword}
              isLoading={isLoading}
            />
            <RegisterForm navigation={navigation} />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SIZES.padding },
  header: { alignItems: 'center', marginBottom: SIZES.padding * 2 },
  title: { ...FONTS.h1, marginTop: SIZES.padding, color: COLORS.introduction },
  subtitle: { ...FONTS.body3, color: COLORS.textLight, marginTop: SIZES.base },
  formWrapper: {},
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radius * 2 },
  toggleButton: { flex: 1, alignItems: 'center', paddingVertical: SIZES.padding * 0.75 },
  toggleText: { ...FONTS.h4, color: COLORS.textLight, fontWeight: '500' },
  toggleTextActive: { color: COLORS.introduction, fontWeight: 'bold' },
  toggleTextInactive: { color: COLORS.textLight, opacity: 0.7 },
  activeIndicator: { position: 'absolute', bottom: -SIZES.base / 2, height: 3, width: '40%', backgroundColor: COLORS.primary, borderRadius: 2 },
  animatedForm: { flexDirection: 'row', width: width * 2, marginLeft: -SIZES.padding },
});

export default AuthScreen;
