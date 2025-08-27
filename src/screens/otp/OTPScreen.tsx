import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import OTPInput from '../../components/specific/auth/otp/OTPInput';
import OTPResendButton from '../../components/specific/auth/otp/OTPResendButton';
import { useOTP } from './useOTP';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '../../constants/theme';
import { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPScreen'>;

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params || {};

  const { otp, countdown, isResendDisabled, formattedCountdown, inputRefs, handleOtpChange, handleKeyPress, handleResend, handleSubmit, resetCountdown } =
    useOTP({
      onSubmit: (enteredOtp) => console.log('OTP Submit:', enteredOtp),
      onResend: async () => console.log('OTP Resend')
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>OTP</Text>
        <Text style={styles.subtitle}>Vui lòng nhập mã xác thực được gửi đến {email}</Text>

        <OTPInput
          otp={otp}
          inputRefs={inputRefs}
          handleOtpChange={handleOtpChange}
          handleKeyPress={handleKeyPress}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Xác thực</Text>
        </TouchableOpacity>

        <Text style={styles.countdownText}>
          {isResendDisabled ? `Mã hết hạn sau ${formattedCountdown}` : ''}
        </Text>

        <OTPResendButton handleResend={handleResend} resetCountdown={resetCountdown} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding / 2, marginTop: 30 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: SIZES.padding * 2, justifyContent: 'center', paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: SIZES.padding / 2 },
  subtitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: SIZES.padding * 2 },
  countdownText: { fontSize: 14, color: COLORS.textLight, marginBottom: 8 },
  submitButton: { backgroundColor: COLORS.introduction, paddingVertical: 14, paddingHorizontal: 30, borderRadius: SIZES.radius, alignItems: 'center', marginBottom: 16, width: '100%' },
  submitButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});

export default OTPScreen;
