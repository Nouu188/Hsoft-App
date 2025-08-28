import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOWS, SIZES } from '@/constants/theme';
import { RootStackParamList } from '../../navigation/types';
import type {AuthStackParamList} from '../../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordScreen'>;

// =================================================================
// --- COMPONENT CHÍNH CỦA MÀN HÌNH ---
// =================================================================
const ForgotPasswordScreen: React.FC<Props> = ({navigation, route }) => {
  const [email, setEmail] = useState('');
  const handleResetPassword = () => {
    if (!email) {
        Alert.alert('Lỗi', 'Vui lòng nhập email của bạn.');
        return;
    }

    // Regex kiểm tra định dạng email
     const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailRegex.test(email)) {
        Alert.alert('Lỗi', 'Vui lòng nhập email đúng định dạng (ví dụ: abcxyz@gmail.com).');
        return;
    }

    console.log('Gửi yêu cầu reset mật khẩu cho email:', email);
    navigation.navigate('OTPScreen', { email, type: 'forgotPassword' });
  };


  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* THAY ĐỔI LỚN 1: Bỏ justifyContent ở đây */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                      <Ionicons name="arrow-back" size={28} color={COLORS.textDark} />
                    </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="menu" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Phần nội dung chính */}
          <View style={styles.content}>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email của bạn"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
              >
                <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
              </TouchableOpacity>         
            </View>
          </View>

          {/* Nút quay lại đã được di chuyển lên trên */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// =================================================================
// --- STYLES (ĐÃ ĐƯỢC ĐIỀU CHỈNH) ---
// =================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    // Bỏ justifyContent để nội dung không bị đẩy ra xa nhau
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: SIZES.base*5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingTop:SIZES.base*25,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 32,
  },
  form: {},
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: COLORS.introduction,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // THAY ĐỔI LỚN 3: Cập nhật style cho nút quay lại
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.primaryLight, 
    borderWidth: 1, 
    borderColor:COLORS.border 
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ForgotPasswordScreen;