import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

// Import các thành phần đã được tách ra

import { useAuthForm } from './useAuthForm';
import LoginForm from './child_form/LoginForm';
import RegisterForm from './child_form/RegisterForm';

const { width } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  // Hook quản lý logic giao diện (animation, chuyển tab)
  const { isLoginView, formAnimatedStyle, switchToLogin, switchToRegister } = useAuthForm();

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // Hàm xử lý logic đăng nhập, được truyền xuống LoginForm
  const handleLogin = async (credentials: any) => {
    try {
      await login(credentials);
      // Điều hướng sẽ tự động xảy ra trong App.tsx khi accessToken thay đổi
    } catch (e: any) {
      // Hiển thị lỗi cho người dùng
      Alert.alert('Đăng nhập thất bại', e.message || 'Đã có lỗi xảy ra.');
    }
  };

  // Hàm xử lý logic đăng ký, được truyền xuống RegisterForm
  const handleRegister = async (data: any) => {
    try {
      await register();
      // Sau khi hàm register giả lập chạy xong, có thể hiển thị thông báo
      Alert.alert('Thành công', 'Tài khoản của bạn đã được tạo (giả lập).');
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e.message || 'Đã có lỗi xảy ra.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="medkit" size={60} color={COLORS.primary} />
            <Text style={styles.title}>MedCompanion</Text>
            <Text style={styles.subtitle}>Your daily health partner</Text>
          </View>

          <View style={styles.formWrapper}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={styles.toggleButton} onPress={switchToLogin}>
                <Text style={[styles.toggleText, isLoginView && styles.toggleTextActive]}>Đăng nhập</Text>
                {isLoginView && <Animated.View style={styles.activeIndicator} layout={LinearTransition.duration(300)} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={switchToRegister}>
                <Text style={[styles.toggleText, !isLoginView && styles.toggleTextActive]}>Đăng ký</Text>
                {!isLoginView && <Animated.View style={styles.activeIndicator} layout={LinearTransition.duration(300)} />}
              </TouchableOpacity>
            </View>

            <View style={{ overflow: 'hidden' }}>
              <Animated.View style={[styles.animatedForm, formAnimatedStyle]}>
                {/* Truyền các hàm xử lý và state xuống component con */}
                <LoginForm isLoading={isLoading} onLogin={handleLogin} />
                <RegisterForm isLoading={isLoading} onRegister={handleRegister} />
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SIZES.padding },
  header: { alignItems: 'center', marginBottom: SIZES.padding * 2 },
  title: { ...FONTS.h1, marginTop: SIZES.padding, color: COLORS.primary },
  subtitle: { ...FONTS.body3, color: COLORS.textLight, marginTop: SIZES.base },
  formWrapper: {},
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius * 2, marginBottom: SIZES.padding * 1.5 },
  toggleButton: { flex: 1, alignItems: 'center', paddingVertical: SIZES.padding * 0.75 },
  toggleText: { ...FONTS.h4, color: COLORS.textLight, fontWeight: '500', },
  toggleTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  activeIndicator: { position: 'absolute', bottom: -SIZES.base / 2, height: 3, width: '40%', backgroundColor: COLORS.primary, borderRadius: 2 },
  animatedForm: { flexDirection: 'row', width: width * 2, marginLeft: -SIZES.padding },
});

export default AuthScreen;