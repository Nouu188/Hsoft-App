import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '../../constants/theme'; // Điều chỉnh đường dẫn

import { useOTP } from './useOTP';
import OTPInput from '../../components/specific/auth/otp/OTPInput';
import OTPResendButton from '../../components/specific/auth/otp/OTPResendButton';

const OTPScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  
  // Hàm xử lý logic cuối cùng khi OTP hợp lệ
  const handleFinalSubmit = (enteredOtp: string) => {
    Alert.alert('Xác thực thành công', `Mã OTP của bạn là: ${enteredOtp}`);
    // Ví dụ: navigation.navigate('NewPasswordScreen');
  };

  // Gọi hook để lấy tất cả state và logic
  const {
    otp,
    countdown,
    isResendDisabled,
    inputRefs,
    handleOtpChange,
    handleKeyPress,
    handleResend,
    handleSubmit,
  } = useOTP({ onSubmit: handleFinalSubmit });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>OTP</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập mã xác thực được gửi đến số điện thoại của bạn
        </Text>

        <OTPInput
          otp={otp}
          inputRefs={inputRefs}
          handleOtpChange={handleOtpChange}
          handleKeyPress={handleKeyPress}
        />

        <OTPResendButton
          countdown={countdown}
          isResendDisabled={isResendDisabled}
          handleResend={handleResend}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Xác thực</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding / 2,
    marginTop: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.padding / 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OTPScreen;