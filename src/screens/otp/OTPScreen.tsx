import { useAuthStore } from '@/store/useAuthStore';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OTPInput from '../../components/specific/auth/otp/OTPInput';
import OTPResendButton from '../../components/specific/auth/otp/OTPResendButton';
import { COLORS, SIZES } from '../../constants/theme';
import { useOTP } from './useOTP';

const OTPScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { email, hoten, password } = route.params; // truyền từ màn đăng ký
  
  const setAuthData = useAuthStore(state => state.setAuthData);
  const requestOtp = useAuthStore(state => state.requestOtp);
  const verifyOtp = useAuthStore(state => state.verifyOtp);

  const handleFinalSubmit = async (enteredOtp: string) => {
    try {
      const { user, accessToken } = await verifyOtp(email, enteredOtp);
      Alert.alert('Thành công', 'Xác thực OTP thành công!');
      setAuthData(user, accessToken);

      navigation.navigate('MainApp');
    } catch (error) {
      console.log('[OTPScreen] OTP verify failed', error);
    }
  };

  const { otp, countdown, isResendDisabled, inputRefs, handleOtpChange, handleKeyPress, handleResend, handleSubmit } =
    useOTP({ onSubmit: handleFinalSubmit });

  // Override handleResend để gọi API
  const handleResendWithApi = async () => {
    try {
      await requestOtp(email, hoten, password);
      handleResend();
    } catch (error) {
      console.log('[OTPScreen] Resend OTP failed', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>OTP</Text>
        <Text style={styles.subtitle}>Vui lòng nhập mã xác thực được gửi đến số điện thoại của bạn</Text>

        <OTPInput otp={otp} inputRefs={inputRefs} handleOtpChange={handleOtpChange} handleKeyPress={handleKeyPress} />

        <OTPResendButton countdown={countdown} isResendDisabled={isResendDisabled} handleResend={handleResendWithApi} />
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